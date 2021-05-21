
import Serializable from './Serializable.js';
import minify from './minify.js';
import debug from 'debug';
import _ from 'lodash';
const log = debug('vogue:instance');
import vm from 'vm';
import Module, { Link } from './Module.js';
import System from './System.js';
import { KV } from './KV.js';
/**
 * @typedef {import('./System.js').default} System
 * @typedef {import('./Module.js').default} Module
 */

 
export default class Instance extends Serializable {
	module: Module;
	links = {}
	system: System;
	context: vm.Context;
	locals = [];
	internalFunctions = {};
	_link: Instance;
	location: string;

	createContext(): vm.Context {
		if(this.context) return this.context;

		const initialContext: KV = {};

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

		const context = vm.createContext(initialContext);

		for(const name in this.module.functions) {
			const { code, parameters, async } = this.module.functions[name];
			const injectedScript =
`
var ${name} = ${async ? 'async' : ''} function ${name}(${parameters.join(', ')}) ${code}
`;
			vm.runInContext(injectedScript, context, {
				
			});
		}
		
		return context;
	};

	constructor(module: Module, location: string, parameters: {[name: string]: any}, system: System) {
		super();
		this.module = module;
		this.location = location;
		this.system = system;
		this.context = this.createContext();

		this._link = new Proxy(this, {
			get(target: Instance, prop: string, receiver) {
				log(`getting ${target.module.name.full}.${prop}: (${target.module.identifiers[prop]}|${typeof target.context[prop]})`);
				const DNEText = `${target.module.name.full}.${prop.toString()} either does not exist, or is not accessible`;
				if(prop === 'restore') throw new Error(DNEText);

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
}