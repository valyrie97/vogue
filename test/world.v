
link[] places;
link place;
link character;

restore [[
	if(places.empty()) {
		for(let i = 0; i < 3; i ++) {
			const place = create('places.forest', {
				world: this
			});
			places.push(place);
		}
	}
	console.log(places);
]]