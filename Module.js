

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

	async link() {
		
	}

	static async create(location) {
		const module = new Module();
		const ast = createAst(location);
		const name = parse(location).name;

		module.name.last = name;
		module.name.full = name;

		log.ast('='.repeat(80));
		log.ast(location);
		log.ast(ast);

		try {

			// move module whole loop ass bitch into module.
			for (const item of ast) {
				if ('name' in item && item.name in module.identifiers)
					throw new Error('Identifier ' + item.name + ' already declared!');
					
				module.identifiers[item.name] = item.type;

				if(item.type in module) {
					await module[item.type](item);
				}

				if (item.type === 'link') {
					module.links
						[item.required ? 'required' : 'optional']
						[item.array ? 'arrays' : 'single']
						.push(item.name);

				} else if (item.type === 'namespace') {
					module.name.space = item.namespace;
					module.name.full = module.name.space + '.' + module.name.last;

				} else if (item.type === 'restore') {
					module.functions.restore = item.block;

				} else if (item.type === 'function') {
					module.functions[item.name] = item.block;

				} else if (item.type === 'import') {
					const imported = await import(item.importName);
					if('default' in imported) module.imports[item.name] = imported.default;
					else module.imports[item.name] = imported;

				} else if (item.type === 'variable') {
					module.variables[item.persist ? 'cold' : 'warm'].push(item.name);
				}
			}
		} catch (e) {
			console.error(e);
		}

	}
}

