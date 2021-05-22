import Instance, { Link, SerializedInstance } from './Instance.js';
import _ from 'lodash';
import Module from './Module.js';
import debug from 'debug';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { ensureDirSync } from 'fs-extra';
const log = debug('vogue:system')

const {get, set} = _;

type ModuleNamespaceMap = {
	[key: string]: ModuleNamespaceMap | Module
};

type ModuleName = string;

class System {
	instances: Map<string, Instance> = new Map();
	modules: Module[];
	namespace: ModuleNamespaceMap = {};
	staticLinks: {
		[key: string]: Link
	} = {};
	rootDir: string;

	constructor(modules: Module[], rootDir: string) {
		this.rootDir = rootDir;
		this.modules = modules;
		this.createNamespace();
		
		const vault = readdirSync(resolve(this.rootDir, '.system')).map(v => resolve(this.rootDir, '.system', v));
		const serializedInstances: SerializedInstance[] = vault.map((v) => JSON.parse(readFileSync(v).toString()));

		log('injecting serialized instances...');
		for(const serializedInstance of serializedInstances)
			this.injectSerializedInstance(serializedInstance);
		log('linking serialized instances...');
		for(const serializedInstance of serializedInstances)
			this.linkSerializedInstance(serializedInstance);
		
		log('restoring static instances...');
		for(const [,instance] of this.instances) {
			if(!!instance.module.static) {
				instance.restore();
			}
		}
			
		log('restoring boot instances...');
		for(const [,instance] of this.instances) {
			if(!!instance.module.singleton) {
				instance.restore();
			}
		}
			// this.inject(serializedInstance);
		

		if (vault.length !== 0) {
			return this;
		}

		// TODO future workflow notes
		// pull jsons into boots
		// filter json boots
		// create static / singletons into boots
		// boot boots!


		const bootModules = this.deriveBootModules();
		this.createStaticInstances();

		log('instantiating boot modules...');
		for(const name of bootModules) {
			log('    ' + name);
			this.newLink(name);
		}
	}

	linkSerializedInstance(serializedInstance: SerializedInstance): void {
		const instance = this.getInstanceById(serializedInstance.id);
		for(const name in serializedInstance.links) {
			const linkId = serializedInstance.links[name]
			const linkedInstance = this.getInstanceById(linkId);
			const linkedInstanceLink = linkedInstance.link;
			instance.setLink(name, linkedInstanceLink);
		}
	}

	injectSerializedInstance(serializedInstance: SerializedInstance): void {
		const instance = new Instance(this.getModule(serializedInstance.type), this.rootDir, {}, this, {
			id: serializedInstance.id
		});
		this.instances.set(instance._id, instance);

		for(const name in serializedInstance.members) {
			instance.setMember(name, serializedInstance.members[name]);
		}

		if(instance.module.static) {
			log('injected static instance ' + instance.module.static + ': ' + instance.module.name.full);
			this.staticLinks[instance.module.static] = instance.link;
		}
	}

	getInstanceById(id: string): Instance {
		if(!this.instances.has(id))
			throw new Error(`${id} is not a valid instance link id`);

		return this.instances.get(id) as Instance;
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
			this.staticLinks[module.static] =
				this.newLink(module.name.full, {});
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
		const path = resolve(this.rootDir, '.system');
		ensureDirSync(path);
		const file = instance._id + '.json';
		const filepath = resolve(path, file);
		log('saving ' + instance + '...');
		const json = JSON.stringify(instance.toSerializableObject(), null, 2)
		writeFileSync(filepath, json);
	}

	getModule(name: ModuleName): Module {
		const module = get(this.namespace, name);
		if(module instanceof Module) return module;
		else throw Error(`${name} is not a module`);
	}

	createInstance(name: ModuleName, args = {}) {
		const instance = new Instance(this.getModule(name), this.rootDir, args, this);
		this.saveInstance(instance);
		return instance;
	}

	newLink(name: ModuleName, args = {}) {
		const instance = this.createInstance(name, args);
		const link = instance.link;
		instance.restore();
		return link;
	}
}

export default System;

// class SerializedInstanceInjector {
// 	system: System;
// 	serializedInstances: SerializedInstance[];

// 	constructor(serializedInstances: SerializedInstance[], system: System) {
// 		this.serializedInstances = serializedInstances;
// 		this.system = system;
// 	}
// }