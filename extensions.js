
Object.defineProperty(Array.prototype, 'empty', {
	get() {
		return this.length === 0;
	}
});
