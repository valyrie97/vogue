import { expect } from 'chai';
import '../src/extensions.ts';

describe('extensions', () => {
	it('creates empty array extensions', () => {
		expect(([] as any).empty).to.be.true;
		expect(([1] as any).empty).to.be.false;
		expect(([1, 2, 3] as any).empty).to.be.false;
	});
})