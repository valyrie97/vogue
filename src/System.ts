import Instance, { Link, SerializedInstance } from './Instance.js';
import _ from 'lodash';
import Module from './Module.js';
import debug from 'debug';
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { ensureDirSync } from 'fs-extra';
import * as uuid from 'uuid';
const log = debug('vogue:system');

const {get, set} = _;

type ModuleNamespaceMap = {
	[key: string]: ModuleNamespaceMap | Module
};

type ModuleName = string;

export class System {
	instances: Map<string, Instance> = new Map();
	bootInstances: Map<string, Instance> = new Map();
	staticInstances: Map<string, Instance> = new Map();
	staticLinks: Map<string, Link> = new Map();


	modules: Module[];
	namespace: ModuleNamespaceMap = {};
	rootDir: string;

	static async create(modules: Module[], rootDir: string) {
		const system = new System(modules, rootDir);
		await system.start();
		return system;
	}

	async start() {
		ensureDirSync(resolve(this.rootDir, '.system'));

		log('System startup, in 5 steps!');

		// step 1.1: load serialized instances...
		log('Step 1.1: reading serialized instances...')
		const serializedInstances: SerializedInstance[] = 
			readdirSync(resolve(this.rootDir, '.system'))
			.map(v => resolve(this.rootDir, '.system', v))
			.map(v => JSON.parse(readFileSync(v).toString()));

		// step 1.2: create serialized instances
		log('Step 1.2: creating serialized instances...');
		for(const serializedInstance of serializedInstances)
			this.createInstance(serializedInstance);

		// TODO again, make links automagically tranform from strings to links when needed at runtime, so this isnt needed...
		// step 1.2 addendum:
		log('Step 1.2+: linking serialized instances...');
		for(const serializedInstance of serializedInstances) {
			const instance = this.getInstanceById(serializedInstance.id);
			for(const name in serializedInstance.links) {
				const linkId = serializedInstance.links[name]
				const linkedInstance = this.getInstanceById(linkId);
				const linkedInstanceLink = linkedInstance.link;
				instance.setLink(name, linkedInstanceLink);
			}
		}

		// step 2: validate all modules decalred as static have a static module counterpart
		log('Step 2: creating missing static instances...');
		for(const module of this.modules.filter(module => !!module.static)) {
			const staticIdentifier = module.static;
			const moduleName = module.name.full;
			if(!this.staticLinks.has(staticIdentifier)) {
				this.createInstance({
					type: moduleName,
					links: {},
					members: {},
					id: uuid.v4()
				})
			}
		}
		
		// step 3: create missing singleton instances
		log('Step 3: creating missing singleton instances...');
		for(const module of this.modules.filter(module => !!module.singleton)) {
			let instanceCount = 0;
			for(const [,instance] of this.instances) {
				if(instance.module.name.full === module.name.full) {
					instanceCount ++;
				}
			}
			if(instanceCount === 0) {
				this.createInstance({
					type: module.name.full,
					links: {},
					members: {},
					id: uuid.v4()
				})
			}
		}

		// step 4: create context in all instances
		log('Step 4: create context in instances...');
		for(const [,instance] of this.instances) {
			instance.createContext();
		}

		// step 5: restore all boot modules (static & singleton)
		log('Step 5: restore all boot modules...');
		for(const [,instance] of this.bootInstances) {
			await instance.restore();
		}
		
		// log('restoring static instances...');
		// for(const [,instance] of this.instances) {
		// 	if(!!instance.module.static) {
		// 		await instance.restore();
		// 	}
		// }
			
		// log('restoring boot instances...');
		// for(const [,instance] of this.instances) {
		// 	if(!!instance.module.singleton) {
		// 		await instance.restore();
		// 	}
		// }
		
		// const bootModules = this.deriveBootModules();
		// this.createStaticInstances();

		// log('instantiating boot modules...');
		// for(const name of bootModules) {
		// 	log('    ' + name);
		// 	await this.newLink(name);
		// }
	}

	private constructor(modules: Module[], rootDir: string) {
		this.rootDir = rootDir;
		this.modules = modules;
		this.createNamespace();
	}

	createInstance(serializedInstance: SerializedInstance) {
		// create instance
		const instance = new Instance(this.getModule(serializedInstance.type), {}, this, {
			id: serializedInstance.id
		});

		// preset members
		for(const name in serializedInstance.members) {
			instance.setMember(name, serializedInstance.members[name]);
		}
		// TODO preset links
		// TODO consolidate links/members into args
		
		// add to all isntances
		this.instances.set(instance._id, instance);

		// if its static, add it to both static instance data structures.
		if(instance.module.static) {
			this.staticLinks.set(instance.module.static, instance.link);
			this.staticInstances.set(instance._id, instance);
		}

		// if it static, or just a singleton, add it to boot modules!
		if(instance.module.singleton || instance.module.static) {
			this.bootInstances.set(instance._id, instance);
		}

		return instance;
	}

	getInstanceById(id: string): Instance {
		if(!this.instances.has(id))
			throw new Error(`${id} is not a valid instance link id`);

		return this.instances.get(id) as Instance;
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
		this.namespace = this.modules.reduce((acc, val) => {
			if(get(acc, val.name.full) instanceof Module)
				throw new Error('Duplicate module "' + val.name.full + '"');
			set(acc, val.name.full, val);
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
		console.log('GETTING MODULE', name)
		const module = get(this.namespace, name);
		if(module instanceof Module) return module;
		else throw Error(`unknown module ${name}`);
	}

	async newLink(name: ModuleName, args = {}) {
		const instance = this.createInstance({
			type: name,
			links: args,
			members: {},
			id: uuid.v4()
		});
		instance.createContext();
		await instance.restore();
		return instance.link;
	}
}

// class SerializedInstanceInjector {
// 	system: System;
// 	serializedInstances: SerializedInstance[];

// 	constructor(serializedInstances: SerializedInstance[], system: System) {
// 		this.serializedInstances = serializedInstances;
// 		this.system = system;
// 	}
// }