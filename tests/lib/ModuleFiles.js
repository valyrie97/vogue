
import { resolve, parse } from 'path';
import { fileURLToPath } from 'node:url';

function file(str) {
	return resolve(parse(fileURLToPath(import.meta.url)).dir, '..', 'modules', str + '.v')
}

export const namespaceX = file('namespaceX');
export const namespaceXY = file('namespaceXY');
export const namespaceXYZ = file('namespaceXYZ');

export const link = file('link');
export const linkArray = file('linkArray');
export const requiredLink = file('requiredLink');
export const requiredLinkArray = file('requiredLinkArray');
