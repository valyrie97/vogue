
Object.defineProperty(Array.prototype, 'empty', {
	get() {
		return this.length === 0;
	}
});

// ignored because there seems to be no good way to test this.
// would love to find one though...
/* c8 ignore start */
process.on('unhandledRejection', (reason: Error, p) => {
  console.log(reason.stack ?? reason.name + '\n\nStack trace unavailable...');
});
/* c8 ignore end */