
import Serializable from './Serializable.js';
import minify from './minify.js';
import debug from 'debug';
import _ from 'lodash';
const log = debug('vogue:instance');


export default class Instance extends Serializable {
	module = null;
	links = {}
	system = null;
	context = null;
	locals = [];
	internalFunctions = {};

	// reconstruct context when we need it...
	createContext() {
		let ctx = {};
		for(const name in this.links) {
			ctx[name] = this.links[name];
		}
		for(const name in this.module.imports) {
			ctx[name] = this.module.imports[name];
			this.locals.push(name);
		}
		ctx = {
			...ctx,
			...this.system.staticInstances,
			...this.internalFunctions
		}
		for(const identifier in this.system.staticInstances) {
			this.locals.push(identifier);
		}
		ctx.create = this.system.newInstance.bind(this.system);
		this.locals.push('create');
		this.context = ctx;
	};

	ready = false;

	constructor(module, location, parameters, system) {
		super();
		this.module = module;
		this.location = location;
		this.system = system;
		for(const name of this.module.links.optional.arrays) this.links[name] = [];
		for(const name of this.module.links.optional.single) this.links[name] = null;
		
		for(const fnName in this.module.functions) {
			this.internalFunctions[fnName] = 
			this.invokeInternal.bind(this, fnName);
		}
		this.createContext();

		this._link = new Proxy(this, {
			get(target, prop, receiver) {
				if(prop === 'restore') return undefined;
				if(prop in target.module.functions) {
					return target.invokeInternal.bind(target, prop);
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
		const content = this.module.functions[name].code;
		const passingArguments = _.zipObject(this.module.functions[name].parameters, args);
		if(!content) throw new TypeError(name + ' is not a function!');
		return evalInContext(content, this.context, this.locals, passingArguments);
	}

	get link () {
		return this._link;
	}
}

function evalInContext(js, context, locals, passingArguments) {
	//# Return the results of the in-line anonymous function we .call with the passed context
	log('='.repeat(80) + 'OG Block');
	log(js);
	log('='.repeat(80) + 'Arguments');
	log(passingArguments);
	const that = this;
	return function() {
		const preminJs = 
`'use strict';
(() => {
	${locals.map((k) => `const ${k} = this.${k};`).join('\n\t')}
	${Object.keys(passingArguments).map(name => `let ${name} = passingArguments.${name};`).join('\n\t')}
	${js}
})();`;
		log('='.repeat(80) + 'preminjs');
		log(preminJs);
		const newJs = minify(preminJs);
		log('='.repeat(80) + 'minjs');
		log(newJs);
		// newJs should inject into result...
		let result;
		eval(newJs);
		return result;
	}.call(context);
}