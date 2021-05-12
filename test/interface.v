namespace vogue
static Interface;

import 'terminal-kit' as terminalKit;

choice(message, choices, type) {
	console.log('im being called!');
	// const {terminal} = terminalKit;
	// type ??= 'string';

	// return new Promise(res => {
		
	// 	terminal.saveCursor();
	// 	// terminal(message.split(/\x1b\[39m/g).join(', '));
	// 	// const loc = await new Promise (res => terminal.getCursorLocation((err, x, y) => res([x, y])));
	// 	for(const part of message.split(/\x1b\[39m/g)) {
	// 		terminal.cyan(part);
	// 	}
	// 	terminal.cyan('\n');

	// 	terminal.singleColumnMenu(choices, (error, response) => {
	// 		terminal.restoreCursor();
	// 		terminal.cyan(`${message} `);
	// 		terminal(response.selectedText + '\n').eraseDisplayBelow();
	// 		if(type === 'string') {
	// 			res(response.selectedText);
	// 		} else {
	// 			res(response.selectedIndex);
	// 		}
	// 	});
	// });
}