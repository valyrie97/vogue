import { createAst, DirectiveRule, DirectiveValue, FunctionRule, ImportRule, LinkRule, NamespaceRule, VariableRule } from './createAst'
import path from 'path';
import debug from 'debug';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
const log = debug('vogue:module');

type Link = {
	name: string,
	array: boolean,
	required: boolean
}

export default class Module {
	links: Link[] = [];
	globals = [];
	functions: {
		[name: string]: {
			code: string,
			parameters: string[]
		}
	} = {};
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
	};
	directives: {
		[key: string]: DirectiveValue
	} = {
		'singleton': false,
		'keepalive': false,
		'static': ''
	};
	rootDir: string = '';
	

	async directive({directive, value}: DirectiveRule) {
		this.directives[directive] = value;
	}

	async link({required, array, name}: LinkRule) {
		this.links.push({
			name,
			required,
			array
		});
	}

	async namespace({namespace}: NamespaceRule) {
		this.name.space = namespace;
		this.name.full = this.name.space + '.' + this.name.last;
	}

	async function({name, block, parameters}: FunctionRule) {
		this.functions[name] = {
			code: block,
			parameters
		};
	}

	async import({importName, name}: ImportRule) {
		const nodePath = path.resolve(this.rootDir, 'node_module');
		log('#'.repeat(80));
		log(nodePath);
		const __require__ = createRequire(nodePath);
		const imported = __require__(importName);
		if('default' in imported) this.imports[name] = imported.default;
		else this.imports[name] = imported;
	}

	async variable({persist, name}: VariableRule) {
		this.variables[persist ? 'cold' : 'warm'].push(name);
	}

	static async create(location: string, rootDir: string) {
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

