member count;

increment() {
	count ++;
	sync();
}

getCount() {
	return count;
}