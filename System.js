import Instance from './Instance.js';
import Serializable from './Serializable.js';
import _ from 'lodash';
import Module from './Module.js';
import debug from 'debug';
const log = debug('vogue:system')

const {get, set} = _;

export default class System extends Serializable {
	instances = [];
	modules = null;
	namespace = null;

	constructor(modules, location = '.running') {
		super();
		this.modules = modules;
		this.createNamespace();
		const bootModules = this.deriveBootModules();

		log('instantiating modules...');
		for(const name of bootModules)
			this.newInstance(name);
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
		log('creating namespace map...');
		this.namespace = this.modules.reduce((acc, val) => {
			if(get(acc, val.name.full) instanceof Module)
				throw new Error('Duplicate module "' + val.name.full + '"');
			set(acc, val.name.full, val);
			log('    ' + val.name.full);
			return acc;
		}, {});
	}

	getModule(name) {
		return get(this.namespace, name);
	}

	createInstance(name, args = {}) {
		return new Instance(this.getModule(name), null, args, this);
	}

	newInstance(name, args = {}) {
		const instance = this.createInstance(name, args);
		const link = instance.link;
		instance.invokeInternal('restore');
		return link;
	}
}