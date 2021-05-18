#!/usr/bin/env node
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
// globals inside grammar context
import minify from './minify.js';

const { get, set } = _;
const standardLibrary = resolve(fileURLToPath(dirname(import.meta.url)), 'lib');

(async () => {
	// TODO simplify this line gaddam
	log('reading', systemLocation, '...');
	const files = [
		...readdirSync(systemLocation).map(v => resolve(systemLocation, v)),
		...readdirSync(standardLibrary).map(v => resolve(standardLibrary, v))
	];
	const fullpaths = files
		.filter(v => lstatSync(v).isFile())
		.filter(v => parse(v).ext === '.v');
	for(const path of fullpaths) log(path);
	log('parsing modules...');
	const modules = await Promise.all(fullpaths.map(loc => Module.create(loc, systemLocation)));
	
	const sys = new System(modules, systemLocation);
})()
