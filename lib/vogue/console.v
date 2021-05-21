static console;

import chalk from 'chalk';
import tk from 'terminal-kit';
import ansi from 'sisteransi';
import debugFactory from 'debug';
import util from 'util';

runtime member debug;

restore {
	const {terminal} = tk;
	terminal.on('key', function(name, matches, data) {
		if (name === 'CTRL_C') {
			process.exit(2);
		}
	});

	debug ??= debugFactory('vogue:console');
	
	this.write(ansi.cursor.hide);
	debug('Booted console plugin!');
}

log(a) {
	if(typeof a === 'number') a = chalk.yellow(a); 
	if(typeof a === 'object') a = util.formatWithOptions({ colors: true }, '%o', a)

	// const string = a.toString();

	process.stdout.write(a + '\n');
}

choice(message, choices, type) {
	const {terminal} = tk;
	type ??= 'string';

	return new Promise(res => {

		for(const part of message.split(/\x1b\[39m/g)) {
			terminal.cyan(part);
		}
		terminal.cyan('\n');

		terminal.singleColumnMenu(choices, (error, response) => {
			// terminal.restoreCursor();
			this.write(ansi.cursor.left + ansi.cursor.up(choices.length + 2));
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

clear {
	this.write(ansi.erase.screen);
}