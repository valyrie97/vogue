static console;

import chalk from 'chalk';
import tk from 'terminal-kit';
import ansi from 'sisteransi';

restore {
	const {terminal} = tk;
	terminal.on('key', function(name, matches, data) {
		if (name === 'CTRL_C') {
			process.exit(2);
		}
	});
	console.log(this);
	this.write(ansi.cursor.hide);
}

log(a) {
	if(typeof a === 'number') a = chalk.yellow(a); 

	// const string = a.toString();

	process.stdout.write(a + '\n');
}

choice(message, choices, type) {
	const {terminal} = tk;
	type ??= 'string';

	return new Promise(res => {
		
		// terminal.saveCursor();

		for(const part of message.split(/\x1b\[39m/g)) {
			terminal.cyan(part);
		}
		terminal.cyan('\n');

		terminal.singleColumnMenu(choices, (error, response) => {
			// terminal.restoreCursor();
			this.write(ansi.cursor.left + ansi.cursor.up(2 + response.selectedIndex));
			terminal.cyan(`${message} `);
			terminal.grabInput(false);
			// terminal.move

			terminal(response.selectedText + '\n').eraseDisplayBelow();
			if(type === 'string') {
				res(response.selectedText);
			} else {
				res(response.selectedIndex);
			}
		});
	});
}

write(a) {
	process.stdout.write(a);
}