
import Serializable from './Serializable.js';
import minify from './minify.js';

export default class Instance extends Serializable {
	module = null;
	links = {}
	system = null;
	context = null;

	// reconstruct context when we need it...
	createContext() {
		const ctx = {};
		for(const name in this.links) {
			ctx[name] = this.links[name];
		}
		for(const name in this.module.imports) {
			ctx[name] = this.module.imports[name];
		}
		// ctx.Instance = Instance;
		ctx.create = this.system.newInstance.bind(this.system);
		this.context = ctx;
	};

	constructor(module, location, parameters, system) {
		super();
		this.module = module;
		this.location = location;
		this.system = system;
		for(const name of this.module.links.optional.arrays) this.links[name] = [];
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

	invokeInternal(name, ...args) {
		const content = this.module.functions[name];
		evalInContext(content, this.context);
	}

	get link () {
		return this._link;
	}
}

function evalInContext(js, context) {
	//# Return the results of the in-line anonymous function we .call with the passed context
	const that = this;
	return function() {
		const preminJs = `
		${Object.entries(context).map(([k, v]) => `
		const ${k} = this.${k};
		`).join('\n')}
		${js}`;
		const newJs = minify(preminJs);
		return eval(newJs);
	}.call(context);
}