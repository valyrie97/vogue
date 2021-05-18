link[] places;
link place;
link character;

import random from 'random-world';

restore {
	if(this.places.empty) {
		for(let i = 0; i < 10; i ++) {
			const name = random.city();
			if(name.indexOf(' ') > -1) {
				i --;
				continue;
			}
			console.log(name);
		}
	}

	character ??= create('')
}

async render() {

}