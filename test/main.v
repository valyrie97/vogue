import 'terminal-kit' as terminalkit;
singleton;

link currentSave;

restore {
	terminalkit.terminal.cyan('~Welcome to Vogue~\n');
	this.currentSave ??= create('world', {});
}