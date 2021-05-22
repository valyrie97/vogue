import { createAst } from './../out/createAst.js';
import { expect } from 'chai';
import * as ModuleFiles from './lib/ModuleFiles.js'

describe('Lexer', () => {
	describe('namespaces', () => {
		it('parses namespaces without dots', () => {
			const ast = createAst(ModuleFiles.namespaceX);
			expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x'}]);
		});
		it('parses namespaces with a single dot', () => {
			const ast = createAst(ModuleFiles.namespaceXY);
			expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x.y'}]);
		});
		it('parses namespaces two dots', () => {
			const ast = createAst(ModuleFiles.namespaceXYZ);
			expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x.y.z'}]);
		});
	})

	describe('links', () => {
		it('parses link', () => {
			const ast = createAst(ModuleFiles.link);
			expect(ast).to.deep.equal([{type: 'link', array: false, required: false, name: 'test'}]);
		});
		it('parses required link', () => {
			const ast = createAst(ModuleFiles.requiredLink);
			expect(ast).to.deep.equal([{type: 'link', array: false, required: true, name: 'test'}]);
		});
		it('parses link array', () => {
			const ast = createAst(ModuleFiles.linkArray);
			expect(ast).to.deep.equal([{type: 'link', array: true, required: false, name: 'test'}]);
		});
		it('parses required link array', () => {
			const ast = createAst(ModuleFiles.requiredLinkArray);
			expect(ast).to.deep.equal([{type: 'link', array: true, required: true, name: 'test'}]);
		});
	})
})