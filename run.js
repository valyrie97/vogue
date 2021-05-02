#!/usr/bin/env node

import { resolve, parse } from 'path';
import { readFileSync, readdirSync, readFile, fstat, mkdirSync } from 'fs';
import nearley from 'nearley';
import compile from 'nearley/lib/compile.js';
import generate from 'nearley/lib/generate.js';
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';
import moo from 'moo';
const grammarFile = 'grammar.ne';
import Serializable from './Serializable.js';
import Module from './Module.js';
import System from './System.js';
import Instance from './Instance.js';
import minify from './minify.js';

Array.prototype.empty = function empty() {
	return this.length === 0;
}


function createParser() {
    // Parse the grammar source into an AST
    const grammarParser = new nearley.Parser(nearleyGrammar);
    grammarParser.feed(readFileSync(grammarFile).toString());
    const grammarAst = grammarParser.results[0]; // TODO check for errors

    // Compile the AST into a set of rules
    const grammarInfoObject = compile(grammarAst, {});
    // Generate JavaScript code from the rules
    const grammarJs = generate(grammarInfoObject, "grammar");

		const lexer = moo.compile({
			LINK: 'link',
			RESTORE: 'restore',
			NAMESPACE: 'namespace',
			REQUIRED: 'required',
			ARRAY: '[]',
			OBJECT: '{}',
			DOTOP: '.',
			JS_BLOCK: /\[\[[^]*?\n\]\]$/,
			IDENTIFIER: /[a-zA-Z][a-zA-Z0-9]*/,
			SPACE: {match: /\s+/, lineBreaks: true},
			SEMICOLON: ';'
		});

    // Pretend this is a CommonJS environment to catch exports from the grammar.
    const module = { exports: {} };
    eval(grammarJs);

    const grammar = module.exports;
		return new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
}

const systemLocation = resolve(process.argv[2]);
const entry = process.argv[3];
const modules = {};
readdirSync(systemLocation).map(v => resolve(systemLocation, v)).map(parseModule);
const sys = new System(modules);

function parseModule(location) {
	const parser = createParser();
	const contents = readFileSync(location).toString();
	const name = parse(location).name;
	parser.feed(contents);
	parser.finish();
	const module = new Module();
	const parsed = parser.results[0];

	module.name.last = name;
	module.name.full = name;
	for(const item of parsed) {
		switch(item.type) {
			case 'link': {
				if(item.name in module.identifiers)
					throw new Error('Identifier ' + item.name + ' already declared!');
				module.identifiers[item.name] = 'link';
				module.links
					[item.required ? 'required' : 'optional']
					[item.array ? 'arrays' : 'single']
					.push(item.name);
				break;
			}
			case 'namespace': {
				module.name.space = item.namespace;
				module.name.full = module.name.space + '.' + module.name.last;
				break;
			}
			case 'restore': {
				if(item.name in module.identifiers)
					throw new Error('Identifier ' + item.name + ' already declared!');
				module.identifiers['restore'] = 'function';
				module.functions['restore'] = item.block;
				break;
			}
		}
	}

	modules[module.name.full] = module;

}
