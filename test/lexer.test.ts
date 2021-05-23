import { createAst } from '../out/createAst.js';
import { expect } from 'chai';
import * as ModuleFiles from './lib/ModuleFiles.js'

describe('Lexer', () => {

	it('parses blank file', () => {
		const ast: any = createAst(ModuleFiles.blank);
		expect(ast).to.deep.equal([]);
	});

	describe('namespaces', () => {
		it('parses namespaces without dots', () => {
			const ast: any = createAst(ModuleFiles.namespaceX);
			expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x'}]);
		});
		it('parses namespaces with a single dot', () => {
			const ast: any = createAst(ModuleFiles.namespaceXY);
			expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x.y'}]);
		});
		it('parses namespaces two dots', () => {
			const ast: any = createAst(ModuleFiles.namespaceXYZ);
			expect(ast).to.deep.equal([{type: 'namespace', namespace: 'x.y.z'}]);
		});
	});

	describe('links', () => {
		it('parses link', () => {
			const ast: any = createAst(ModuleFiles.link);
			expect(ast).to.deep.equal([{type: 'link', array: false, required: false, name: 'test'}]);
		});
		it('parses required link', () => {
			const ast: any = createAst(ModuleFiles.requiredLink);
			expect(ast).to.deep.equal([{type: 'link', array: false, required: true, name: 'test'}]);
		});
		it('parses link array', () => {
			const ast: any = createAst(ModuleFiles.linkArray);
			expect(ast).to.deep.equal([{type: 'link', array: true, required: false, name: 'test'}]);
		});
		it('parses required link array', () => {
			const ast: any = createAst(ModuleFiles.requiredLinkArray);
			expect(ast).to.deep.equal([{type: 'link', array: true, required: true, name: 'test'}]);
		});
	});

	describe('functions', () => {
		it('function with parameters omitted', () => {
			const ast: any = createAst(ModuleFiles.functionNoParams);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.include({type: 'function', name: 'test', async: false});
			expect(ast[0].parameters).to.be.an('array').of.length(0);
		});
		it('function with empty parameters', () => {
			const ast: any = createAst(ModuleFiles.functionEmptyParams);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.include({type: 'function', name: 'test', async: false});
			expect(ast[0].parameters).to.be.an('array').of.length(0);
		});
		it('function with one parameter', () => {
			const ast: any = createAst(ModuleFiles.functionOneParam);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.include({type: 'function', name: 'test', async: false});
			expect(ast[0].parameters).to.be.an('array').deep.equals(["a"]);
		});
		it('function with two parameters', () => {
			const ast: any = createAst(ModuleFiles.functionTwoParams);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.include({type: 'function', name: 'test', async: false});
			expect(ast[0].parameters).to.be.an('array').deep.equals(["a", "b"]);
		});
		
		it('async function with parameters omitted', () => {
			const ast: any = createAst(ModuleFiles.asyncFunctionNoParams);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.deep.include({type: 'function', name: 'test', async: true});
			expect(ast[0].parameters).to.be.an('array').of.length(0);
		});
		it('async function with empty parameters', () => {
			const ast: any = createAst(ModuleFiles.asyncFunctionEmptyParams);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.deep.include({type: 'function', name: 'test', async: true});
			expect(ast[0].parameters).to.be.an('array').of.length(0);
		});
		it('async function with one parameter', () => {
			const ast: any = createAst(ModuleFiles.asyncFunctionOneParam);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.deep.include({type: 'function', name: 'test', async: true});
			expect(ast[0].parameters).to.be.an('array').deep.equals(["a"]);
		});
		it('async function with two parameters', () => {
			const ast: any = createAst(ModuleFiles.asyncFunctionTwoParams);
			expect(ast).to.be.an('array').with.length(1);
			expect(ast[0]).to.be.an('object');
			expect(ast[0]).to.deep.include({type: 'function', name: 'test', async: true});
			expect(ast[0].parameters).to.be.an('array').deep.equals(["a", "b"]);
		});
	});
	
});