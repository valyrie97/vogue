import createAst from './createAst.js'
import path from 'path';
import debug from 'debug';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
const log = debug('vogue:module');

export default class Module {
	links = {
		required: {
			single: [],
			arrays: []
		},
		optional: {
			single: [],
			arrays: []
		}
	};
	globals = [];
	functions = [];
	identifiers = {};
	name = {
		space: '',
		last: '',
		full: ''
	};
	imports = {};
	variables = {
		cold: [],
		warm: []
	}
	singleton = false;
	keepalive = false;
	'static' = null;

	async directive({directive, value}) {
		this[directive] = value ?? true;
	}

	async link({required, array, name}) {
		this.links
			[required ? 'required' : 'optional']
			[array ? 'arrays' : 'single']
			.push(name);
	}

	async namespace({namespace}) {
		this.name.space = namespace;
		this.name.full = this.name.space + '.' + this.name.last;
	}

	async function({name, block, parameters}) {
		this.functions[name] = {
			code: block,
			parameters
		};
	}

	async import({importName, name}) {
		const nodePath = path.resolve(this.rootDir, 'node_module');
		log('#'.repeat(80));
		log(nodePath);
		const __require__ = createRequire(nodePath);
		const imported = __require__(importName);
		if('default' in imported) this.imports[name] = imported.default;
		else this.imports[name] = imported;
	}

	async variable({persist, name}) {
		this.variables[persist ? 'cold' : 'warm'].push(name);
	}

	static async create(location, rootDir) {
		const module = new Module();
		const ast = createAst(location);
		const name = path.parse(location).name;

		module.name.last = name;
		module.name.full = name;
		module.rootDir = rootDir;

		for (const item of ast) {
			if ('name' in item) {
				if(item.name in module.identifiers)
					throw new Error('Identifier ' + item.name + ' already declared!');
				else module.identifiers[item.name] = item.type;
			}

			if(item.type in module) {
				await module[item.type](item);
			}
		}

		log('='.repeat(80));
		log(location);
		log(module);

		return module;
	}
}

