

export default class Module {
	links = {
		required: {
			single: [],
			arrays: []
		},
		optional: {
			single: [],
			arrays: []
		}
	};
	globals = [];
	functions = [];
	identifiers = {};
	name = {
		space: '',
		last: '',
		full: ''
	};
	imports = {};
	variables = {
		cold: [],
		warm: []
	}
}