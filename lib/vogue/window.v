namespace SDL;

keepalive;

import sdl from '@kmamal/sdl';
import util from 'util';
import Canvas from 'canvas';

runtime member window;
runtime member running;
runtime member canvas;
runtime member context;

link scene;

async restore {
	// console.log('he...hello?')
	window ??= sdl.video.createWindow({
		width: 800,
		height: 600
	});
	running ??= true;

	canvas ??= Canvas.createCanvas(800, 600);
	context ??= canvas.getContext('2d');

	gameLoop();

}

async gameLoop() {
	if(!running) return;

	scene?.render(context, this._link);
	window.render(800, 600, 3200, sdl.video.FORMAT.BGRA32, canvas.toBuffer('raw'))

	processEvents();
	setTimeout(gameLoop, 0);
}

processEvents {
	let event
	while ((event = sdl.events.poll())) {
		// console.log(event);
		if (event.type === 'quit') {
			running = false;
			window.destroy();
		}
	}
}

setScene(a) {
	scene = a;
}