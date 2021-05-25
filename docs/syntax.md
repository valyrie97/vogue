# Vogue programming language & framework

## Table of Contents

- [Basic System Structure](#Basic-System-Structure)
- [Directives](#directives)
	- [keepalive directive](#keepalive-directive)
	- [singleton directive](#singleton-directive)
	- [static directive](#static-directive)
- [functions](#functions)
- [restore](#restore)
- [Links](#links)


## Basic System Structure

A Vogue system is a database of interlinked instances and their persistent data. Only one thing is required to start a vogue system: The list of modules to be included in the system.

At the initial creation of a Vogue system, if there is no database to load from, any template module with the [singleton directive](#singleton-directive) will have an instance created of itself, without any predefined parameters.

When a database is loaded, all instances who's template module has the [keepalive directive](#keepalive-directive) will be [restored](#restore).

## Keepalive Directive

`WARNING: the keepalive directive is not fully implemented. You may include it in your module files, however their existence in memory is not yet guaranteed.`

The keepalive directive is used to describe that a module should always remain in memory. This directive applies only to instances. This means that if no instances exist of a particular template module with the keepalive directive, then no instances will be restored.

```vogue
keepalive;
```

## Singleton Directive

The singleton directive is used to describe a template module which should always have an instance of itself in memory. If one does not exist, it will be created. A system will never be running in a state where a template module which has a singleton directive does not have a corresponding instance.

The singleton directive implies the keepalive directive. 

```vogue
singleton;
```

## Static Directive

The static directive is like the singleton directive, except it makes the created instance available to all other instances in the system. These can be thought of as global variables. For example, `console` in vogue refers to the static instance (as a [link](#links)) of the console module.

The identifier after the static keyword is the name that is globally injected.

```
static util;

foo {
	console.log('I can be called from anywhere!');
}

restore {
	util.foo();
}
```

## Functions

Functions are declared with an identifier, parameters (optional) and a javascript code block. 

```vogue
functionName (param1, param2) {
	// javacsript code
}

anotherFunction {
	// javascript code
}
```

## Restore

Restore is a special function that is invoked when an instance is created or awoken.

## Links