import Instance from './Instance.js';
import _ from 'lodash';
import Module from './Module.js';
import debug from 'debug';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { ensureDirSync } from 'fs-extra';
const log = debug('vogue:system')

const {get, set} = _;

type ModuleNamespaceMap = {
	[key: string]: ModuleNamespaceMap | Module
};

type ModuleName = string;

class System {
	instances: Instance[] = [];
	modules: Module[];
	namespace: ModuleNamespaceMap = {};
	staticInstances: {
		[key: string]: Instance
	} = {};
	rootDir: string;

	constructor(modules: Module[], rootDir: string) {
		this.rootDir = rootDir;
		this.modules = modules;
		this.createNamespace();
		const bootModules = this.deriveBootModules();
		this.createStaticInstances();

		log('instantiating boot modules...');
		for(const name of bootModules) {
			log('    ' + name);
			this.newInstance(name);
		}
	}

	createStaticInstances() {
		log('deriving static modules...');
		const staticModules = this.modules.filter((module) => {
			return !!module.static;
		}).map((module) => {
			log('    ' + module.name.full);
			return module;
		});

		log('instantiating static modules...');
		for(const module of staticModules) {
			log('    ' + module.static + ': ' + module.name.full);
			this.staticInstances[module.static] =
				this.newInstance(module.name.full, {});
		}
	}

	deriveBootModules() {
		log('deriving boot modules...');
		const bootModules = this.modules.filter((module) => {
			return module.singleton;
		}).map((module) => {
			return module.name.full;
		});
		
		for(const name of bootModules)
			log('    ' + name);

		return bootModules;
	}

	createNamespace() {
		log('creating namespace map...');
		this.namespace = this.modules.reduce((acc, val) => {
			if(get(acc, val.name.full) instanceof Module)
				throw new Error('Duplicate module "' + val.name.full + '"');
			set(acc, val.name.full, val);
			log('    ' + val.name.full);
			return acc;
		}, {});
	}

	saveInstance(instance: Instance): void {
		log('saving ' + instance)
		const path = resolve(this.rootDir, '.system');
		ensureDirSync(path);
		const file = instance._id + '.json';
		const filepath = resolve(path, file);
		log(filepath);
		const json = JSON.stringify(instance.toSerializableObject(), null, 2)
		log(json);
		writeFileSync(filepath, json);
		log('synced ' + instance);
	}

	getModule(name: ModuleName): Module {
		const module = get(this.namespace, name);
		if(module instanceof Module) return module;
		else throw Error(`${name} is not a module`);
	}

	createInstance(name: ModuleName, args = {}) {
		const instance = new Instance(this.getModule(name), '', args, this);
		this.saveInstance(instance);
		return instance;
	}

	newInstance(name: ModuleName, args = {}) {
		const instance = this.createInstance(name, args);
		const link = instance.link;
		instance.restore();
		return link;
	}
}

export default System;