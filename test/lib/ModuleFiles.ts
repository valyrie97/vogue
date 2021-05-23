
import { resolve, parse } from 'path';
import { fileURLToPath } from 'url';

function file(str: string) {
	return resolve(parse(fileURLToPath(import.meta.url)).dir, '..', 'modules', str + '.v')
}

export const blank = file('blank');

export const namespaceX = file('namespaceX');
export const namespaceXY = file('namespaceXY');
export const namespaceXYZ = file('namespaceXYZ');

export const link = file('link');
export const linkArray = file('linkArray');
export const requiredLink = file('requiredLink');
export const requiredLinkArray = file('requiredLinkArray');

export const functionNoParams = file('functionNoParams');
export const functionEmptyParams = file('functionEmptyParams');
export const functionOneParam = file('functionOneParam');
export const functionTwoParams = file('functionTwoParams');
export const asyncFunctionNoParams = file('asyncFunctionNoParams');
export const asyncFunctionEmptyParams = file('asyncFunctionEmptyParams');
export const asyncFunctionOneParam = file('asyncFunctionOneParam');
export const asyncFunctionTwoParams = file('asyncFunctionTwoParams');
