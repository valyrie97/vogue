import nearley from 'nearley';
import compile from 'nearley/lib/compile.js';
import generate from 'nearley/lib/generate.js';
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';
import moo from 'moo';
import tokens from './tokens.js';
import { readFileSync } from 'fs';
import minify from './minify.js';
const grammarFile = 'grammar.ne';

function createParser() {
	// Parse the grammar source into an AST
	const grammarParser = new nearley.Parser(nearleyGrammar);
	grammarParser.feed(readFileSync(grammarFile).toString());
	const grammarAst = grammarParser.results[0]; // TODO check for errors

	// Compile the AST into a set of rules
	const grammarInfoObject = compile(grammarAst, {});
	// Generate JavaScript code from the rules
	const grammarJs = generate(grammarInfoObject, "grammar");

	const lexer = moo.compile(tokens);

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

export default function createAst(location) {
	const parser = createParser();
	const contents = readFileSync(location).toString();

	
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
	return parser.results[0];
}