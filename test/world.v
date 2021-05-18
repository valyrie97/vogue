link[] places;
link place;
link character;

import random from 'random-world';

restore {
	if(this.places.empty)
		this.createPlaces();

	this.character ??= create('')
}

async render() {

}

createPlaces() {
	for(let i = 0; i < 10; i ++) {
		const name = random.city();
		const valid = !!name.match(/^[A-Za-z ]*$/);
		if(!valid) {
			i --;
			continue;
		}
		console.log(name);
	}
}