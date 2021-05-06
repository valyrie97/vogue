namespace xyz.places;

link[] places;
link place;
link character;

restore [[
	if(places.empty) {
		for(let i = 0; i < 3; i ++) {
			const place = create('xyz.places.places.forest', {
				world: this
			});
			places.push(place);
		}
	}

	for(const place of places) {
		place.ping();
	}
]]