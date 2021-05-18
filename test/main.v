singleton;

link currentSave;

async restore {
	console.log('~ Welcome to Vogue ~');
	// process.stdout.write(JSON.stringify(console, null, 2))
	this.currentSave ??= create('world', {});
	const choice = await console.choice('select a thing', ['a', 'b', 'c', 'd']);
}