singleton;

link counter;
link window;

async restore {
	// process.stdout.write(typeof console._link + '\n');
	console.log('~ Welcome to Vogue ~');
	// process.stdout.write(JSON.stringify(console, null, 2))
	counter ??= create('counter', {});
	for(let i = 0; i < 10; i ++)
		counter.increment();
	// const choice = await console.choice('select a thing', ['a', 'b', 'c', 'd']);

	console.log(counter.getCount());

	// window ??= create('SDL.window', {});

	// window.setScene()

	// await counter.render();
}