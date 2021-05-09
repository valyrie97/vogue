#!/usr/bin/env node

import { resolve, parse } from 'path';
import { readFileSync, readdirSync } from 'fs';
import nearley from 'nearley';
import compile from 'nearley/lib/compile.js';
import generate from 'nearley/lib/generate.js';
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';
import moo from 'moo';
const grammarFile = 'grammar.ne';
import _ from 'lodash';
const { get, set } = _;
import Module from './Module.js';
import System from './System.js';
const debug = true;

// globals inside grammar context
import minify from './minify.js';

Object.defineProperty(Array.prototype, 'empty', {
	get() {
		return this.length === 0;
	}
});

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
		NAMESPACE: 'namespace',
		REQUIRED: 'required',
		SINGLETON: 'singleton',
		KEEPALIVE: 'keepalive',
		STATIC: 'static',
		MEMBER: 'member',
		RUNTIME: 'runtime',
		IMPORT: 'import',
		AS: 'as',
		STRING: /'(?:\\['\\]|[^\n'\\])*'/,
		ARRAY: '[]',
		OBJECT: '{}',
		DOTOP: '.',
		JS_BLOCK: /\[\[[^]*?\n\]\]$/,
		JS_BLOCK2: /{[^]*?\n}$/,
		IDENTIFIER: /[a-zA-Z][a-zA-Z0-9]*/,
		SPACE: { match: /\s+/, lineBreaks: true },
		SEMICOLON: ';'
	});

	// lexer.__proto__.formatError = function(token, message) {
	// 	if (token == null) {
	// 		// An undefined token indicates EOF
	// 		var text = this.buffer.slice(this.index)
	// 		var token = {
	// 			text: text,
	// 			offset: this.index,
	// 			lineBreaks: text.indexOf('\n') === -1 ? 0 : 1,
	// 			line: this.line,
	// 			col: this.col,
	// 		}
	// 	}
	// 	var start = Math.max(0, token.offset - token.col + 1)
	// 	var eol = token.lineBreaks ? token.text.indexOf('\n') : token.text.length
	// 	var firstLine = this.buffer.substring(start, token.offset + eol)
	// 	message += " at line " + token.line + " col " + token.col + ":\n\n"
	// 	message += "  " + firstLine + "\n"
	// 	message += "  " + Array(token.col).join(" ") + "^"
	// 	return message
	// }

	// Pretend this is a CommonJS environment to catch exports from the grammar.
	const module = { exports: {} };
	eval(grammarJs);

	const grammar = module.exports;
	return new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
}

const systemLocation = resolve(process.argv[2]);
const entry = process.argv[3];

(async () => {
	// TODO simplify this line gaddam
	const modules = 
		(await Promise.all(
			readdirSync(systemLocation)
			.map(v => resolve(systemLocation, v))
			.map(parseModule)
		)).reduce((acc, val) => {
			set(acc, val.name.full, val);
			return acc;
		}, {});
	
	const sys = new System(modules);
})()

async function parseModule(location) {
	const parser = createParser();
	const contents = readFileSync(location).toString();
	const name = parse(location).name;
	const module = new Module();

	// parser.reportError = function(token) {
	// 	return JSON.stringify(token, null, 2);
	//   var message = this.lexer.formatError(token, 'invalid syntax') + '\n';
	//   message += 'Unexpected ' + (token.type ? token.type + ' token: ' : '');
	//   message +=
	//     JSON.stringify(token.value !== undefined ? token.value : token) + '\n';
	//   return message;
	// };

	parser.feed(contents);
	parser.finish();
	const parsed = parser.results[0];

	module.name.last = name;
	module.name.full = name;
	try {

		// move this whole loop ass bitch into module.
		for (const item of parsed) {
			if ('name' in item && item.name in module.identifiers)
				throw new Error('Identifier ' + item.name + ' already declared!');
				
			module.identifiers[item.name] = item.type;

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

	return module;

}
