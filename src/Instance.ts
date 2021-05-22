import debug from 'debug';
import _ from 'lodash';
const log = debug('vogue:instance');
import vm from 'vm';
import Module, { Link, Variable } from './Module.js';
import System from './System.js';
import * as uuid from 'uuid';
/**
 * @typedef {import('./System.js').default} System
 * @typedef {import('./Module.js').default} Module
 */

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
	context: vm.Context;
	locals = [];
	internalFunctions = {};
	_link: Instance;
	location: string;
	_id: string;

	createContext(): vm.Context {
		if(this.context) return this.context;

		const initialContext: any = {};

		// system globals!
		// TODO turn this into its own vogue module! system.create/instance.create
		// TODO request context from system...
		initialContext.create = this.system.newInstance.bind(this.system);
		initialContext.process = process;
		for(const name in this.system.staticInstances)
			initialContext[name] = this.system.staticInstances[name];

		// local links!
		// optional arrays
		// TODO maybe make these property accessors to allow for some automation
		for(const link of this.module.links.filter((v: Link) => v.array && !v.required))
			initialContext[link.name] = [];
		for(const link of this.module.links.filter((v: Link) => !v.array && !v.required))
			initialContext[link.name] = null;
		for(const variable of this.module.variables)
			initialContext[variable.name] = null;
		for(const name in this.module.imports)
			initialContext[name] = this.module.imports[name];

		// instance defined functions
		initialContext.sync = this.system.saveInstance.bind(this.system, this);

		const context = vm.createContext(initialContext);

		// user defined functions
		for(const name in this.module.functions) {
			const { code, parameters, async } = this.module.functions[name];
			const injectedScript =
`
var ${name} = ${async ? 'async' : ''} function ${name}(${parameters.join(', ')}) ${code}
${name} = ${name}.bind(this);
`;
			vm.runInContext(injectedScript, context, {});
		}
		
		return context;
	};

	constructor(module: Module, location: string, parameters: {[name: string]: any}, system: System) {
		this.module = module;
		this.location = location;
		this.system = system;
		this.context = this.createContext();
		this._id = uuid.v4();

		this._link = new Proxy(this, {
			get(target: Instance, prop: string, receiver) {
				log(`getting ${target.module.name.full}.${prop}: (${target.module.identifiers[prop]}|${typeof target.context[prop]})`);
				const DNEText = `${target.module.name.full}.${prop.toString()} either does not exist, or is not accessible`;
				if(prop === 'restore') throw new Error(DNEText);
				if(prop === '__link__') return target._id;

				if(prop in target.module.functions) {
					return target.context[prop];
				}
				throw new Error(DNEText);
			}
		});
	}

	restore() {
		return this.context.restore?.();
	}

	get link () {
		return this._link;
	}

	toSerializableObject(): SerializedInstance {
		const obj: any = {};
		obj.type = this.module.name.full;
		obj.links = Object.fromEntries(this.module.links.map((link: Link): [string, string] => {
			const name = link.name;
			const linkId = this.context[name]?.__link__;
			return [name, linkId];
		}));
		obj.members = Object.fromEntries(
			this.module.variables
				.filter((member: Variable): boolean => {
					return member.persist;
				})
				.map((member: Variable): [string, any] => {
					const name = member.name;
					const value = this.context[name];
					return [name, value];
				})
		);
		obj.id = this._id;

		return obj as SerializedInstance;
	}

	toString() {
		return this.module.name.full + '(' + this._id + ')';
	}
}