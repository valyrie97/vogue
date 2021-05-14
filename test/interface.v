namespace vogue
static Interface;

import 'terminal-kit' as terminalKit;

restore {
	const {terminal} = terminalKit;
	terminal.grabInput();
	terminal.on('key', function(name, matches, data) {

		if (name === 'CTRL_C') {
			process.exit(2);
		}
	});
}

choice(message, choices, type) {
	const {terminal} = terminalKit;
	type ??= 'string';

	return new Promise(res => {
		
		terminal.saveCursor();

		for(const part of message.split(/\x1b\[39m/g)) {
			terminal.cyan(part);
		}
		terminal.cyan('\n');

		terminal.singleColumnMenu(choices, (error, response) => {
			terminal.restoreCursor();
			terminal.cyan(`${message} `);
			terminal(response.selectedText + '\n').eraseDisplayBelow();
			if(type === 'string') {
				res(response.selectedText);
			} else {
				res(response.selectedIndex);
			}
		});
	});
}