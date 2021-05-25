singleton;

async restore {
	await create('this.module.doesnt.exist');
}