namespace places;

required link world;
link[] roads;

member fertility;

restore {
	this.fertility ??= Math.floor(Math.random() * 100);
}

ping {
	return new Date().getTime();
}