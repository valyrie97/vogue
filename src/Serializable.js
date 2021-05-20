// import { Ubjson } from '@shelacek/ubjson';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export default class Serializable {
	// things that need to be stored only in cold
	// storage are keyed with a special prefix
	static CLASS_REFERENCE = '$$CLASS_NAME';

	// things that need to be stored only at runtime
	// are keyed with symbols to not interfere with
	// user code.
	static PERSIST_LOCATION = Symbol('PERSIST_LOCATION');

	start() {}

	toUbj() {
		return Ubjson.encode(this.toSerializableObject());
	}

	static fromUbj(buffer) {
		return this.fromSerializableObject(Ubjson.decode(buffer));
	}

	toJson() {
		return JSON.stringify(this.toSerializableObject(), null, 2);
	}

	static fromJson(str) {
		return this.fromSerializableObject(JSON.parse(str));
	}

	toSerializableObject() {

		const transformValue = (val) => {
			if(Array.isArray(val)) {
				return transformArray(val);
			} else if (val === null || val === undefined) {
				return val;
			} else if(typeof val === 'object') {
				return transformObject(val);
			} else {
				return val;
			}
		}

		const transformObject = (obj) => {
			const clone = {};
			for(const prop of Object.keys(obj)) {
				if(prop.startsWith('_')) continue;

				clone[prop] = transformValue(obj[prop]);
			}
			if(obj instanceof Serializable) {
				clone[Serializable.CLASS_REFERENCE] = obj.constructor.name;
			}
			return clone;
		}

		const transformArray = (arr) => {
			const clone = [];
			for(const item of arr) {
				clone.push(transformValue(item));
			}
			return clone;
		}
		
		return transformObject(this);
	}

	static fromSerializableObject(obj) {
		if(obj[Serializable.CLASS_REFERENCE] !== this.name) return null;

		const transformValue = (val) => {
			if(Array.isArray(val)) {
				return transformArray(val);
			} else if(val === null || val === undefined) {
				return val;
			} else if(typeof val === 'object') {
				if(Serializable.CLASS_REFERENCE in val) {
					const classes = this.serializationDependencies();
					const matchingClasses = classes.filter(classObject => classObject.name === val[Serializable.CLASS_REFERENCE]);
					if(matchingClasses.length === 1) {
						return matchingClasses[0].fromSerializableObject(val);
					} else {
						return transformObject(val);
					}
				}
				return transformObject(val);
			} else {
				return val;
			}
		}

		const transformObject = (obj) => {
			const clone = {};
			for(const prop of Object.keys(obj)) {
				if(prop.startsWith('_')) continue;

				clone[prop] = transformValue(obj[prop]);
			}
			return clone;
		}

		const transformArray = (arr) => {
			const clone = [];
			for(const item of arr) {
				clone.push(transformValue(item));
			}
			return clone;
		}

		const clone = transformObject(obj);
		if(Serializable.CLASS_REFERENCE in obj)
			clone.__proto__ = this.prototype;

		clone.restore();

		return clone;
	}

	serialize({
		encoding = 'json'
	} = {}) {

		switch(encoding) {
			case 'json': return this.toJson();
			case 'ubjson':
			case 'ubj': return this.toUbj();
			default: {
				throw new TypeError('Unknown encoding: ' + encoding);
			}
		}

	}
	
	static deserialize(obj, {
		encoding = 'json'
	} = {}) {

		switch(encoding) {
			case 'json': return this.fromJson(obj);
			case 'ubjson':
			case 'ubj': return this.fromUbj(obj);
			default: {
				throw new TypeError('Unknown encoding: ' + encoding);
			}
		}
	}

	async restore() {}

	static createFromDisk(filename, ...args) {
		if(existsSync(filename)) {
			const instance = this.deserialize(readFileSync(createFilepath(filename)));
			instance[Serializable.PERSIST_LOCATION] = createFilepath(filename);
			instance.restore();
			return instance;
		} else {
			const instance = new this(...args);
			instance[Serializable.PERSIST_LOCATION] = createFilepath(filename);
			instance.updateDisk();
			return instance;
		}
	}

	updateDisk(filepath) {
		// if it hasnt yet been written to disk...
		// this can happen if the contrustor 
		// was called outside of createFromDisk
		if(filepath) {
			this[Serializable.PERSIST_LOCATION] = createFilepath(filepath);
		}
		const data = this.serialize();
		writeFileSync(this[Serializable.PERSIST_LOCATION], data);
	}
}

function createFilepath(path) {
	return `data/${path}`;
}