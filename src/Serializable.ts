// import { Ubjson } from '@shelacek/ubjson';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { KV } from './KV';

export default class Serializable {

	constructor(...args: any[]) {}

	// things that need to be stored only in cold
	// storage are keyed with a special prefix
	static CLASS_REFERENCE = '$$CLASS_NAME';

	// things that need to be stored only at runtime
	// are keyed with symbols to not interfere with
	// user code.
	static PERSIST_LOCATION = Symbol('PERSIST_LOCATION');

	start() {}

	// toUbj() {
	// 	return Ubjson.encode(this.toSerializableObject());
	// }

	// static fromUbj(buffer) {
	// 	return this.fromSerializableObject(Ubjson.decode(buffer));
	// }

	toJson() {
		return JSON.stringify(this.toSerializableObject(), null, 2);
	}

	static serializationDependencies(): any[] {
		return [];
	}

	static fromJson(str: string) {
		return this.fromSerializableObject(JSON.parse(str));
	}

	toSerializableObject() {

		const transformValue = (val: any): any => {
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

		const transformObject = (obj: KV): KV => {
			const clone: KV = {};
			for(const prop of Object.keys(obj)) {
				if(prop.startsWith('_')) continue;

				clone[prop] = transformValue(obj[prop]);
			}
			if(obj instanceof Serializable) {
				clone[Serializable.CLASS_REFERENCE] = obj.constructor.name;
			}
			return clone;
		}

		const transformArray = (arr: any[]): any[] => {
			const clone = [];
			for(const item of arr) {
				clone.push(transformValue(item));
			}
			return clone;
		}
		
		return transformObject(this);
	}

	static fromSerializableObject(obj: KV) {
		if(obj[Serializable.CLASS_REFERENCE] !== this.name) return null;

		const transformValue = (val: any): any => {
			if(Array.isArray(val)) {
				return transformArray(val);
			} else if(val === null || val === undefined) {
				return val;
			} else if(typeof val === 'object') {
				if(Serializable.CLASS_REFERENCE in val) {
					const classes = this.serializationDependencies();
					const matchingClasses = classes.filter((classObject) => {
						classObject.name === val[Serializable.CLASS_REFERENCE]
					});
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

		const transformObject = (obj: KV): KV => {
			const clone: KV = {};
			for(const prop of Object.keys(obj)) {
				if(prop.startsWith('_')) continue;

				clone[prop] = transformValue(obj[prop]);
			}
			return clone;
		}

		const transformArray = (arr: any[]): any[] => {
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
			// case 'ubj': return this.toUbj();
			default: {
				throw new TypeError('Unknown encoding: ' + encoding);
			}
		}

	}
	
	static deserialize(obj: any, {
		encoding = 'json'
	} = {}) {

		switch(encoding) {
			case 'json': return this.fromJson(obj);
			case 'ubjson':
			// case 'ubj': return this.fromUbj(obj);
			default: {
				throw new TypeError('Unknown encoding: ' + encoding);
			}
		}
	}

	async restore() {}

	static createFromDisk(filename: string, ...args: any[]) {
		if(existsSync(filename)) {
			const instance = this.deserialize(readFileSync(createFilepath(filename)));
			// TS is plain and simply wrong... symbols can be used to index object...
			// @ts-ignore
			instance[Serializable.PERSIST_LOCATION] = createFilepath(filename);
			instance?.restore();
			return instance;
		} else {
			const instance = new this(...args);
			// again... TS is wrong...
			// @ts-ignore
			instance[Serializable.PERSIST_LOCATION] = createFilepath(filename);
			instance?.updateDisk();
			return instance;
		}
	}

	updateDisk(filepath?: string) {
		// if it hasnt yet been written to disk...
		// this can happen if the contrustor 
		// was called outside of createFromDisk
		if(filepath) {
			// see above... TS7053 is just _wrong_. incorrect. thats not how JS works.
			// @ts-ignore
			this[Serializable.PERSIST_LOCATION] = createFilepath(filepath);
		}
		const data = this.serialize();
		// this is getting annoying...
		// @ts-ignore
		writeFileSync(this[Serializable.PERSIST_LOCATION], data);
	}
}

function createFilepath(path: string) {
	return `data/${path}`;
}