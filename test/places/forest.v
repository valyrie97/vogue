namespace places;

required link world;
link[] roads;

member nitrogen;

restore {
	this.nitrogen ??= Math.floor(Math.random() * 50);
}

