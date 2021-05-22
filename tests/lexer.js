import { createAst } from './../out/createAst.js';
import { readFileSync } from 'fs';
import { resolve, parse } from 'path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';

describe('Lexer', () => {
	it('parses namespaces without dots', () => {
		const ast = createAst(resolve(parse(fileURLToPath(import.meta.url)).dir, 'modules', 'namespaceX.v'));
		expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x'}]);
	});
	it('parses namespaces with a single dot', () => {
		const ast = createAst(resolve(parse(fileURLToPath(import.meta.url)).dir, 'modules', 'namespaceXY.v'));
		expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x.y'}]);
	});
	it('parses namespaces two dots', () => {
		const ast = createAst(resolve(parse(fileURLToPath(import.meta.url)).dir, 'modules', 'namespaceXYZ.v'));
		expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x.y.z'}]);
	});
})