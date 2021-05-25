![](/docs/banner.png)
![Travis (.com)](https://img.shields.io/travis/com/marcus13345/vogue)
![Codecov](https://img.shields.io/codecov/c/github/marcus13345/vogue)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmarcus13345%2Fvogue.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmarcus13345%2Fvogue?ref=badge_shield)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/vogue)
[![NPM](https://nodei.co/npm/vogue-runtime.png?downloads=true&downloadRank=true)](https://nodei.co/npm/vogue-runtime/)

Vogue is a programming language that leverages javascript to create no-config graph systems.

# Getting Started

To create a vogue system, create a vogue module file in a new folder:
`example/main.v`
```
singleton;

restore {
	console.log('Hellow Vogue!');
}
```
then run your system with `vogue example`.

# NPM Integration

your vogue system folder may have a `package.json` and a `node_modules` folder. If they do, you can import javascript modules into your vogue module.

```
example
|-- package.json
|-- main.v
`-- node_modules
    `-- package
        |-- package.json
        `-- index.js
```
```
singleton;

import package from 'package';

restore {
	console.log(package.foo());
}
```

# Persistence

Vogue systems automagically persist their data, unless otherwise specified. This data is stored inside the `.system` directory.

# Documentation

For the full spec of vogue module syntax, see: [syntax](docs/syntax.md).

To see some common examples and programming patterns, see [examples](examples).

# License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmarcus13345%2Fvogue.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmarcus13345%2Fvogue?ref=badge_shield)