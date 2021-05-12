
import Serializable from './Serializable.js';
import minify from './minify.js';

export default class Instance extends Serializable {
	module = null;
	links = {}
	system = null;
	context = null;
	locals = [];

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
			...this.system.staticInstances
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
		// console.log('invoking', name);
		const content = this.module.functions[name];
		if(!content) throw new TypeError(name + ' is not a function!');
		return evalInContext(content, this.context, this.locals);
	}

	get link () {
		return this._link;
	}
}

minify()

function evalInContext(js, context, locals) {
	//# Return the results of the in-line anonymous function we .call with the passed context
	const that = this;
	return function() {
		const preminJs = `
		'use strict';
		(() => {
		${locals.map((k) => `
		const ${k} = this.${k};
		`).join('\n')}
		${js};
		})();`;
		const newJs = minify(preminJs);
		// newJs should inject into result...
		let result;
		eval(newJs);
		return result;
	}.call(context);
}