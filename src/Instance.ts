
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
		initialContext.create = this.system.createInstance.bind(this.system);
		for(const name in this.system.staticInstances)
			initialContext[name] = this.system.staticInstances[name];

		// local links!
		// optional arrays
		// TODO maybe make these property accessors to allow for some automation
		for(const link of this.module.links.filter((v: Link) => v.array && !v.required))
			initialContext[link.name] = [];
		for(const link of this.module.links.filter((v: Link) => !v.array && !v.required))
			initialContext[link.name] = null;

		const context = vm.createContext(initialContext);

		for(const name in this.module.functions) {
			const { code, parameters, async } = this.module.functions[name];
			const injectedScript =
`
var ${name} = ${async ? 'async' : ''} function ${name}(${parameters.join(', ')}) ${code}
`;
			vm.runInContext(injectedScript, context);
		}
		
		// local functions time!
		// for(const name of this.module.functions)



		// let ctx = vm.createContext({
		// 	create: this.system.newInstance.bind(this.system),
		// 	...this.system.staticInstances,
		// 	...this.internalFunctions
		// });

		
		// for(const name in this.module.imports) {
		// 	ctx[name] = this.module.imports[name];
		// 	this.locals.push(name);
		// }
		// ctx = {
		// 	...ctx,
			
		// }
		// for(const identifier in this.system.staticInstances) {
		// 	this.locals.push(identifier);
		// }
		// // ctx.create = 
		// this.locals.push('create');
		return context;
	};

	constructor(module: Module, location: string, parameters: {[name: string]: any}, system: System) {
		super();
		this.module = module;
		this.location = location;
		this.system = system;
		this.context = this.createContext();

		this._link = new Proxy(this, {
			get(target: Instance, prop, receiver) {
				if(prop === 'restore') return undefined;
				if(prop in target.module.functions) {
					// TODO return the fn
					return 
				}
				return undefined;
			}
		});
	}

	hasPublicFunction(name: string) {
		return (name in this.module.functions);
	}

	invokeInternal(name: string, ...args: any[]): any {
		log('invoking', this.module.name.full + '.' + name, 'with args', args);

		if(typeof this.context[name] === 'function') {
			this.context[name](...args);
		} else throw new Error(`${name} is not a function in ${this.module.name.full}`)
	}

	get link () {
		return this._link;
	}
}