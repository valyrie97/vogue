singleton;

import 'terminal-kit' as terminalkit;


link currentSave;

restore {
	terminalkit.terminal.cyan('~Welcome to Vogue~\n');
	this.currentSave ??= create('xyz.places.world', {});
}