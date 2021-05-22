#!/usr/bin/env node --enable-source-maps --unhandled-rejections=strict
import debug from 'debug';
const log = debug('vogue:cli');
const systemLocation = resolve(process.argv[2]);

import { parse, resolve, dirname } from 'path';
import { readdirSync, lstatSync } from 'fs';

import _ from 'lodash';
import Module from './Module.js';
import System from './System.js';
import './extensions.js';
import { fileURLToPath } from 'url';

const { get, set } = _;
const standardLibrary = resolve(fileURLToPath(dirname(import.meta.url)), '..', 'lib', 'vogue');

(async () => {
	const ignoreDeps = (path: string) => parse(path).name !== 'node_modules';

	const files = [
		...walkdirSync(systemLocation, ignoreDeps),
		...walkdirSync(standardLibrary, ignoreDeps)
	];
	const fullpaths = files
		.filter(v => lstatSync(v).isFile())
		.filter(v => parse(v).ext === '.v');
	log('included modules');
	log(files);
	
	log('parsing modules...');
	const modules = await Promise.all(fullpaths.map(loc => Module.create(loc, systemLocation)));
	
	const sys = new System(modules, systemLocation);
})();

function walkdirSync(root: string, filter: ((path: string) => boolean) = () => true): string[] {
	log('reading', root, '...');
	const paths = readdirSync(root).map(v => resolve(root, v));
	const [ files, dirs ] = sift(paths.filter(filter), (v: string) => lstatSync(v).isFile());
	log(`files: ${files.length} | dirs: ${dirs.length}`);
	const rfiles = dirs.map(v => walkdirSync(v, filter)).reduce((a, v) => [...a, ...v], []);

	return [
		...files,
		...rfiles
	];
}

function sift<T>(a: T[], fn: (v: T, i: number, a: T[]) => boolean): [T[], T[]] {
	let left: T[] = [], right: T[] = [];
	for(let i = 0; i < a.length; i ++) {
		const v = a[i]
		const lr = !!fn(v, i, a);
		if(lr) left = [...left, v];
		else right = [...right, v];
	}
	return [left, right];
}