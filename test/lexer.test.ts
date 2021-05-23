import { createAst } from '../out/createAst.js';
import { expect } from 'chai';
import * as ModuleFiles from './lib/ModuleFiles.js'

describe('Lexer', () => {

	it('parses blank file', () => {
		const ast = createAst(ModuleFiles.blank);
		expect(ast).to.deep.equal([]);
	});

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
	});

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
	});

	describe('functions', () => {
		it('function with parameters omitted', () => {
			const ast = createAst(ModuleFiles.functionNoParams);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: [], async: false}]);
		});
		it('function with empty parameters', () => {
			const ast = createAst(ModuleFiles.functionEmptyParams);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: [], async: false}]);
		});
		it('function with one parameter', () => {
			const ast = createAst(ModuleFiles.functionOneParam);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: ["a"], async: false}]);
		});
		it('function with two parameters', () => {
			const ast = createAst(ModuleFiles.functionTwoParams);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: ["a", "b"], async: false}]);
		});
		
		it('async function with parameters omitted', () => {
			const ast = createAst(ModuleFiles.asyncFunctionNoParams);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: [], async: true}]);
		});
		it('async function with empty parameters', () => {
			const ast = createAst(ModuleFiles.asyncFunctionEmptyParams);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: [], async: true}]);
		});
		it('async function with one parameter', () => {
			const ast = createAst(ModuleFiles.asyncFunctionOneParam);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: ["a"], async: true}]);
		});
		it('async function with two parameters', () => {
			const ast = createAst(ModuleFiles.asyncFunctionTwoParams);
			expect(ast).to.deep.equal([{type: 'function', name: 'test', block: '{\n\t\n}', parameters: ["a", "b"], async: true}]);
		});
	});
	
});