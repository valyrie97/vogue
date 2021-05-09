link[] places;
link place;
link character;

restore {
	if(this.places.empty) {
		for(let i = 0; i < 3; i ++) {
			const place = create('xyz.places.places.forest', {
				world: this
			});
			this.places.push(place);
		}
	}

	for(const place of this.places) {
		place.ping();
	}
}