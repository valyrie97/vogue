singleton;
link window

link menuScene;

restore {
	window ??= create('SDL.window');

	menuScene ??= create('menu');

	window.setScene(menuScene);
}