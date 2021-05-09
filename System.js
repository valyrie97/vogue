import Instance from './Instance.js';
import Serializable from './Serializable.js';
import _ from 'lodash';

const {get, set} = _;

export default class System extends Serializable {
	instances = [];
	modules = null;

	constructor(modules, location = '.running') {
		super();
		this.modules = modules;
		try {
			mkdirSync(location);
		} catch {}
		this.newInstance('main');
	}

	getModule(name) {
		return get(this.modules, name);
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