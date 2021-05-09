# Vogue programming language & framework

## Table of Contents

- [Basic System Structure](#Basic-System-Structure)
- [Directives](#directives)
	- [keepalive directive](#keepalive-directive)
	- [singleton directive](#singleton-directive)
- [functions](#functions)
- [restore](#restore)
- [Links](#links)


## Basic System Structure

A Vogue system is a database of interlinked instances and their persistent data. Two things are required to start: A group (usually a directory) of vogue modules that a system knows, and a database to load from or create (usually in the form of a single file).

At the initial creation of a Vogue system, if there is no database to load from, any template module with the [singleton directive](#singleton-directive) will have an instance created of itself, without any predefined parameters.

When a database is loaded, all instances who's template module has the [keepalive directive](#keepalive-directive) will be [restored](#restore).

## Keepalive Directive

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

## Functions

functions can be referred to in other functions with or without the `this.` prefix. Use the prefix to disambiguate if local variables exist with the same identifier. 

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