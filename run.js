#!/usr/bin/env node

import { resolve, parse } from 'path';
import { readFileSync, readdirSync, readFile, fstat, mkdirSync } from 'fs';
import nearley from 'nearley';
import compile from 'nearley/lib/compile.js';
import generate from 'nearley/lib/generate.js';
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';
import moo from 'moo';
const grammarFile = 'grammar.ne';
// import Serializable from './Serializable.js';
import Module from './Module.js';
import System from './System.js';
// import Instance from './Instance.js';

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

import _ from 'lodash';
const {get, set} = _;

const systemLocation = resolve(process.argv[2]);
const entry = process.argv[3];
const modules = {};
readdirSync(systemLocation).map(v => resolve(systemLocation, v)).map(parseModule);
const sys = new System(modules);

function parseModule(location) {
	const parser = createParser();
	const contents = readFileSync(location).toString();
	const name = parse(location).name;
	// parser.reportError = function(token) {
	// 	return JSON.stringify(token, null, 2);
  //   var message = this.lexer.formatError(token, 'invalid syntax') + '\n';
  //   message += 'Unexpected ' + (token.type ? token.type + ' token: ' : '');
  //   message +=
  //     JSON.stringify(token.value !== undefined ? token.value : token) + '\n';
  //   return message;
  // };
	try {
		parser.feed(contents);
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}
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
			case 'function': {
				if(item.name in module.identifiers)
					throw new Error('Identifier ' + item.name + ' already declared!');
				module.identifiers[item.name] = 'function';
				module.functions[item.name] = item.block;
			} //WE JUST ADDED THE FUNCION TO THE MODULE TEMPLATE.
			// TODO ADD IT TO THE INSTANCE LEVEL, THEN CONTEXT, THEN LiNK PROXY.
		}
	}

	set(modules, module.name.full, module);

}
