#!/usr/bin/env node

import { resolve, parse } from 'path';
import { readdirSync } from 'fs';

import _ from 'lodash';
const { get, set } = _;
import Module from './Module.js';
import System from './System.js';
import * as log from './debug.js';
import createAst from './createAst.js';

// globals inside grammar context
import minify from './minify.js';

Object.defineProperty(Array.prototype, 'empty', {
	get() {
		return this.length === 0;
	}
});


const systemLocation = resolve(process.argv[2]);
const entry = process.argv[3];

(async () => {
	// TODO simplify this line gaddam
	const modules = 
		(await Promise.all(
			readdirSync(systemLocation)
			.map(v => resolve(systemLocation, v))
			.map(loc => new Module(loc))
		)).reduce((acc, val) => {
			set(acc, val.name.full, val);
			return acc;
		}, {});
	
	const sys = new System(modules);
})()
