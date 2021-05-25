static a;

restore() {
	if(typeof b !== 'object') {
		throw new Error('Static instance A does not exist!');
	} else b.fun();
}

fun() {
	
}