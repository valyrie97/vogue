static b;

restore() {
	if(typeof a !== 'object') {
		throw new Error('Static instance A does not exist!');
	} else a.fun();
}

fun() {
	console.log('hello from B');
}