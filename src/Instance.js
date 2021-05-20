
import Serializable from './Serializable.js';
import minify from './minify.js';
import debug from 'debug';
import _ from 'lodash';
const log = debug('vogue:instance');
import vm from 'vm';
/**
 * @typedef {import('./System.js').default} System
 * @typedef {import('./Module.js').default} Module
 */

 
export default class Instance extends Serializable {
	/** @type {Module} */
	module = null;
	links = {}
	system = null;
	context = null;
	locals = [];
	internalFunctions = {};
	/** @type {Proxy<Instance>} */
	_link = null;

	createContext() {
		const initialContext = {};

		// system globals!
		// TODO turn this into its own vogue module! system.create/instance.create
		// TODO request context from system...
		initialContext.create = this.system.create.bind(this.system);
		for(const name of this.system.staticInstances)
			initialContext[name] = this.system.staticInstances[name];

		// local links!
		// optional arrays
		// TODO maybe make these property accessors to allow for some automation
		for(const name of this.module.links.optional.arrays)
			initialContext[name] = [];
		for(const name of this.module.links.optional.single)
			initialContext[name] = null;
		
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
		this.context = ctx;
	};

	/**
	 * 
	 * @param {Module} module 
	 * @param {string} location 
	 * @param {Object<string, any>} parameters 
	 * @param {System} system 
	 */
	constructor(module, location, parameters, system) {
		super();
		this.module = module;
		this.location = location;
		this.system = system;
		
		this.createContext();

		this._link = new Proxy(this, {
			get(target, prop, receiver) {
				if(prop === 'restore') return undefined;
				if(prop in target.module.functions) {
					// TODO return the fn
					return 
				}
				return undefined;
			}
		});
	}

	hasPublicFunction(name) {
		return (name in this.module.functions);
	}

	invokeInternal(name, ...args) {
		log('invoking', this.module.name.full + '.' + name, 'with args', args);
	}

	get link () {
		return this._link;
	}
}