import nearley from 'nearley';
// TODO none of these shits have typings, but its OKAY
// @ts-ignore
import compile from 'nearley/lib/compile.js';
// @ts-ignore
import generate from 'nearley/lib/generate.js';
// @ts-ignore
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';
// @ts-ignore
import moo from 'moo';
import tokens from './tokens';
import { readFileSync } from 'fs';
import debug from 'debug';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
var log = debug('vogue:ast');
var grammarFile = resolve(fileURLToPath(dirname(import.meta.url)), 'grammar.ne');
log('grammarFile:', grammarFile);
function createParser() {
    // Parse the grammar source into an AST
    var grammarParser = new nearley.Parser(nearleyGrammar);
    grammarParser.feed(readFileSync(grammarFile).toString());
    var grammarAst = grammarParser.results[0]; // TODO check for errors
    // Compile the AST into a set of rules
    var grammarInfoObject = compile(grammarAst, {});
    // Generate JavaScript code from the rules
    var grammarJs = generate(grammarInfoObject, "grammar");
    var lexer = moo.compile(tokens);
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
    var module = { exports: {} };
    eval(grammarJs);
    var grammar = module.exports;
    // THESE IS COMPLICATED SHITS, IDK MAN WHAT ARE TYPINGS
    // @ts-ignore
    return new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
}
export function createAst(location) {
    var parser = createParser();
    var contents = readFileSync(location).toString();
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
    var ast = parser.results[0];
    log('='.repeat(80));
    log(location);
    log(ast);
    return ast || [];
}
