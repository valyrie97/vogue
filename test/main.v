import 'terminal-kit' as terminalkit;
singleton;

link currentSave;

async restore {
	terminalkit.terminal.cyan('~Welcome to Vogue~\n');
	this.currentSave ??= create('world', {});
	// console.log(Interface);
	const choice = await Interface.choice('select a thing', ['a', 'b', 'c']);
}