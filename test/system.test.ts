import { createSystem } from './lib/System.js';
import { expect } from './lib/expect.js'

describe('system', () => {
	it('cross linked static instances', (done) => {
		expect(createSystem('crossStaticLinking')).to.eventually.be.fulfilled.notify(done);
	});

	it('non-existant module retrieval throws', (done) => {
		expect(createSystem('unknownModule')).to.eventually.be.rejected.notify(done);
	})
});