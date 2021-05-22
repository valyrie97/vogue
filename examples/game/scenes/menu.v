
render(ctx, window) {
	console.log('rendering!');
	// process.stdout.write(typeof console.log);
	ctx.font = `${Math.floor(600 / 5)}px serif`
	ctx.fillStyle = 'red'
	ctx.textAlign = 'center'
	ctx.fillText("Hello, World!", 800 / 2, 600 / 2)
}