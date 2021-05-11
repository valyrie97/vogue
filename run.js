#!/usr/bin/env node

import { resolve } from 'path';
import { readdirSync } from 'fs';

import _ from 'lodash';
import Module from './Module.js';
import System from './System.js';
import debug from 'debug';
import './extensions.js';
// globals inside grammar context
import minify from './minify.js';

const { get, set } = _;
const log = debug('vogue:cli');
const systemLocation = resolve(process.argv[2]);

(async () => {
	// TODO simplify this line gaddam
	log('reading', systemLocation, '...');
	const files = readdirSync(systemLocation);
	const fullpaths = files.map(v => resolve(systemLocation, v));
	for(const path of fullpaths) log(path);
	log('parsing modules...');
	const modules = await Promise.all(fullpaths.map(loc => Module.create(loc)));

	// const modules = 
	// 	(await Promise.all(
	// 		readdirSync(systemLocation)
	// 		.map(v => resolve(systemLocation, v))
	// 		.map(v => { log(v); return v; })
	// 		.map(loc => Module.create(loc))
	// 	)).reduce((acc, val) => {
	// 		set(acc, val.name.full, val);
	// 		return acc;
	// 	}, {});
	
	const sys = new System(modules);
})()
