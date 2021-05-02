
import Serializable from './Serializable.js';
import minify from './minify.js';

export default class Instance extends Serializable {
	module = null;
	links = {}
	system = null;

	// reconstruct context when we need it...
	get context() {
		const ctx = {};
		for(const name in this.links) {
			ctx[name] = this.links[name];
		}
		// ctx.Instance = Instance;
		ctx.create = this.system.newInstance.bind(this.system);
		console.log('context reconstructed', ctx);
		return ctx;
	};

	constructor(module, location, parameters, system) {
		super();
		this.module = module;
		this.location = location;
		this.system = system;
		for(const name of this.module.links.optional.arrays) this.links[name] = [];
	}

	invokeInternal(name, ...args) {
		console.trace();
		const content = this.module.functions[name];
		evalInContext(content, this.context);
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
		console.log(`${'='.repeat(80)}\n${newJs}\n${'='.repeat(80)}`)
		return eval(newJs);
	}.call(context);
}