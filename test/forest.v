namespace places;

required link world;
link[] roads;

member nitrogen;

restore {
	this.nitrogen ??= Math.floor(Math.random() * 50);
}

async takeNitrogen (requested) {
	// give as much nutrients as we can!
	const given = Math.max(this.nitrogen, requested);
	this.nitrogen -= given;
	return given;
}

ping {
	return new Date().getTime();
}