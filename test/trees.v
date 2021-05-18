namespace structures;

member alive;
member age;

required link land;

restore {
	alive ??= true;
	age ??= 0;
}