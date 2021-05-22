import debug from 'debug';
import _ from 'lodash';
const log = debug('vogue:instance');
import vm from 'vm';
import Module, { LinkDescription, Variable } from './Module.js';
import System from './System.js';
import * as uuid from 'uuid';
/**
 * @typedef {import('./System.js').default} System
 * @typedef {import('./Module.js').default} Module
 */

export type Link = any; // BUT PROXY

export type SerializedInstance = {
	type: string,
	links: {
		[name: string]: string
	},
	members: {
		[name: string]: any // SO LONG AS ITS SERIALIZABLE ._.*
	},
	id: string
}
 
export default class Instance {
	module: Module;
	links = {}
	system: System;
	context: vm.Context | null = null;
	locals = [];
	internalFunctions = {};
	_link: Instance;
	location: string;
	_id: string;
	initialContext: any = {};

	get currentContext(): any {
		return this.context ?? this.initialContext;
	}

	sync() {
		this.system.saveInstance(this);
	}

	createContext(): vm.Context {
		if(this.context) return this.context;


		const initialContext: any = {};

		// system globals!
		// TODO turn this into its own vogue module! system.create/instance.create
		// TODO request context from system...
		initialContext.create = this.system.newLink.bind(this.system);
		initialContext.process = process;
		for(const name in this.system.staticLinks) {
			log('creating context with static link: ' + name);
			initialContext[name] = this.system.staticLinks[name];
		}

		// local links!
		// optional arrays
		// TODO maybe make these property accessors to allow for some automation
		for(const link of this.module.links.filter((v: LinkDescription) => v.array && !v.required))
			initialContext[link.name] = [];
		for(const link of this.module.links.filter((v: LinkDescription) => !v.array && !v.required))
			initialContext[link.name] = null;
		for(const variable of this.module.variables)
			attachHookedProperty(initialContext, variable.name, null, this.sync.bind(this))
		for(const name in this.initialContext)
			initialContext[name] = this.initialContext[name]
		for(const name in this.module.imports)
			initialContext[name] = this.module.imports[name];

		// instance defined functions
		initialContext.sync = this.system.saveInstance.bind(this.system, this);

		const context = vm.createContext(initialContext);

		// user defined functions
		for(const name in this.module.functions) {
			const { code, parameters, async } = this.module.functions[name];
			const injectedScript = `
				var ${name} = ${async ? 'async ' : ''}function ${name}(${parameters.join(', ')}) ${code}
				${name} = ${name}.bind(this);`.trim();
			// log('injecting function...')
			// log(injectedScript)
			vm.runInContext(injectedScript, context, {});
		}
		
		log('context created! ' + Object.keys(context));
		// log(context);

		return context;
	};

	setMember(name: string, value: any) {
		log('setMember: ' + this.toString() + '.' + name + ' => ' + value);
		this.currentContext[name] = value;
	}

	setLink(name: string, value: Link) {
		log('setLink: ' + this.toString() + '.' + name + ' => ' + value.__link__);
		this.currentContext[name] = value;
	}

	constructor(
		module: Module,
		location: string,
		parameters: {[name: string]: any},
		system: System,
		options?: {
			id?: string
		}
	) {
		this.module = module;
		this.location = location;
		this.system = system;
		// this.context = this.createContext();
		this._id = options?.id ?? uuid.v4();

		this._link = new Proxy(this, {
			get(target: Instance, prop: string, receiver) {
				log(`getting ${target.module.name.full}.${prop.toString()}: (${target.module.identifiers[prop]}|${typeof target.context?.[prop]})`);

				if(target.context === null)
					target.restore();

				const DNEText = `${target.module.name.full}.${prop.toString()} either does not exist, or is not accessible`;
				if(prop === 'restore') throw new Error(DNEText);
				if(prop === '__link__') return target._id;

				if(prop in target.module.functions) {
					return target.context?.[prop];
				}
				throw new Error(DNEText);
			}
		});
		log('created ' + this);
	}

	restore() {
		if(this.context === null)
			this.context = this.createContext();

		return this.context?.restore?.();
	}

	get link () {
		return this._link;
	}

	toSerializableObject(): SerializedInstance {
		const obj: any = {};
		obj.type = this.module.name.full;
		obj.links = Object.fromEntries(this.module.links.map((link: LinkDescription): [string, string] => {
			const name = link.name;
			const linkId = this.context?.[name]?.__link__;
			return [name, linkId];
		}));
		obj.members = Object.fromEntries(
			this.module.variables
				.filter((member: Variable): boolean => {
					return member.persist;
				})
				.map((member: Variable): [string, any] => {
					const name = member.name;
					const value = this.context?.[name];
					return [name, value];
				})
		);
		obj.id = this._id;

		return obj as SerializedInstance;
	}

	toString() {
		return this.module.name.full + '(' + this._id.substr(0, 4) + ')';
	}
}

function attachHookedProperty(target: any, name: string, initialValue: any, changedHook: () => void) {
	const propId = uuid.v4();
	target[propId] = initialValue;
	// TODO if its an object, replace it with a dead simple proxy? for detecting internal changes...
	Object.defineProperty(target, name, {
		get() {
			return target[propId];
		},
		set(value) {
			target[propId] = value;
			changedHook();
		}
	})
}