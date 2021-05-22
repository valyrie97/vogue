
Object.defineProperty(Array.prototype, 'empty', {
	get() {
		return this.length === 0;
	}
});


process.on('unhandledRejection', (reason: Error, p) => {
  console.log(reason.stack ?? reason.name + '\n\nStack trace unavailable...');
});