namespace places;

required link world;
link[] roads;

member fertility;

restore {
	this.fertility ??= Math.floor(Math.random() * 100);
}

ping {
	console.log('Ping!', new Date().getTime());
}