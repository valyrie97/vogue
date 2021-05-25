import {System} from '../../src/System.js';
import * as tmp from 'tmp';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createAst } from '../../src/createAst.js';
import { readdirSync } from 'fs';
import Module from '../../src/Module.js';

const systemsPath = resolve(fileURLToPath(dirname(import.meta.url)), '..', 'systems');

export async function createSystem(systemName: string) {
	const { name: tmpDir } = tmp.dirSync();

	const modulesPath = resolve(systemsPath, systemName);
	const modules = await Promise.all(readdirSync(modulesPath)
		.map(v => resolve(modulesPath, v))
		.map(v => Module.create(v, modulesPath)));

	const system = await System.create(modules, tmpDir);

	return system;
}