import {
	createAst,
	DirectiveRule,
	FunctionRule,
	ImportRule,
	LinkRule,
	NamespaceRule,
	Rule, 
	VariableRule
} from './createAst.js'
import path from 'path';
import debug from 'debug';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
const log = debug('vogue:module');

export type LinkDescription = {
	name: string,
	array: boolean,
	required: boolean
};

export type Variable = {
	name: string,
	persist: boolean
}

export default class Module {
	links: LinkDescription[] = [];
	globals = [];
	functions: {
		[name: string]: {
			code: string,
			async: boolean,
			parameters: string[]
		}
	} = {};
	identifiers: {
		[name: string]: Rule["type"]
	} = {};
	name = {
		space: '',
		last: '',
		full: ''
	};
	imports: {
		[key: string]: any
	} = {};
	variables: Variable[] = [];
	// directives
	'singleton': boolean = false;
	'keepalive': boolean = false;
	'static': string = '';
	// other stuff
	rootDir: string = '';

	async directive({ directive, value }: DirectiveRule): Promise<void> {
		if (typeof this[directive] === 'boolean')
			(this[directive] as boolean) = value as boolean;
		else if (typeof this[directive] === 'string')
			(this[directive] as string) = value as string;
		//  = value as string;
	}

	async link({ required, array, name }: LinkRule): Promise<void> {
		this.links.push({
			name,
			required,
			array
		});
	}

	async namespace({ namespace }: NamespaceRule): Promise<void> {
		this.name.space = namespace;
		this.name.full = this.name.space + '.' + this.name.last;
	}

	async function({ name, block, parameters, async }: FunctionRule): Promise<void> {
		this.functions[name] = {
			code: block,
			parameters,
			async
		};
	}

	async import({ importName, name }: ImportRule): Promise<void> {
		const nodePath = path.resolve(this.rootDir, 'node_module');
		const __require__ = createRequire(nodePath);
		const imported = __require__(importName);
		if ('default' in imported) this.imports[name] = imported.default;
		else this.imports[name] = imported;
	}

	async variable({ persist, name }: VariableRule): Promise<void> {
		this.variables.push({
			name,
			persist
		});
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
				if (item.name in module.identifiers)
					throw new Error('Identifier ' + item.name + ' already declared!');
				else {
					module.identifiers[item.name] = item.type;
				}
			}

			log(`processing AST Rule (${'name' in item ? name + '|' : '' }${item.type})`);
			// log(item);

			if (item.type in module) {
				const func = module[item.type] as ((arg0: Rule) => Promise<void>)
				func.call(module, item);
			}
		}

		log('='.repeat(80));
		log(location);
		log(module);

		return module;
	}
}

