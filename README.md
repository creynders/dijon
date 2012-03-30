# DIJON FRAMEWORK

Dijon is an IOC and DI micro-framework for Javascript. Originally it was meant to be a port of Robotlegs,
but deviated to something quite different. It remains however heavily inspired by Robotlegs, and more specifically
Swiftsuspenders.

Basically it's an object registry, that allows you to define how and when objects are instantiated, functions and handlers
are called and what objects should be passed on to other objects (that's the injection thingy).

[Pronunciation](http://www.audioenglish.net/dictionary/dijon.htm)

Dijon is a city in France. They make the best mustard. And I can pretend it's an acronym for
Dependency Injection of Javascript Objects N... umm, never found a good fit for 'N'.


## Contact

You can contact me on Twitter with questions/remarks : [@camillereynders](http://twitter.com/camillereynders)

or send me a mail at:
info [at] creynders [dot] be


## Resources

[API documentation](http://creynders.github.com/dijon-framework/docs)

[TodoMVC Demo](https://github.com/creynders/todomvc/tree/master/architecture-examples/dijon)


## FEATURES

* Framework independent: doesn't rely on any other 3rd party frameworks
* Framework integration: easily used on top of other frameworks
* Coding style independent: can be used in class-based or module pattern style.
* Routing: flexible enough to be used as a router
* MVC: although there are no specific classes or functions that enforce an MVC structure on your code,
Dijon was specifically created to facilitate easy MVC(S) structure setup.
(See Demo)
* Instead of DI the Service Locator pattern can be used as well.


## Basics

Dijon consists out of one object: dijon.System. You can call it directly or instantiate it through <code>new</code>,
whatever rocks your boat.

There are three different but closely related entities that can be registered with Dijon:

* Objects, functions and "classes" can be registered to be lazily instantiated or called, either as a factory
or a singleton (a "good" singleton)
* Outlets are injection points, they define what objects should be injected into which receiving objects
* Handlers are callbacks that are registered to be called when a certain event (or route if you prefer) is
sent through the system.

Right after the dependencies of an object have been satisfied, the system will look for a ```setup``` method and automatically call it.
(Robotlegs equivalent of the ```PostConstruct``` meta tag or the ```Mediator#onRegister``` method)


## Examples

[TodoMVC demo](https://github.com/creynders/todomvc/tree/master/architecture-examples/dijon)

### Simple stuff

```javascript
//create a dijon.System instance
var system = new dijon.System();

//register an object to be used as a singleton factory
system.mapSingleton( 'userModel', UserModel );
system.mapSingleton( 'loginController', LoginController );

//to have the UserModel instance injected into another object
//you'll need to define an outlet
system.mapOutlet( 'userModel', 'loginController', 'currentUser' );
//this registers 'currentUser' as an injection point in LoginController instances to be satisfied with the
//instance of UserModel

//you can register functions of mapped objects as event handlers
system.mapHandler( 'Context#startup', 'loginController', 'loginUser' );
//when 'Context#startup' is dispatched the 'loginUser' method of 'loginController' will be called

//no instances have been created yet
//it's only when we call the 'Context#startup' event, an instance of LoginController will be created
//and since it has a dependency on UserModel, the singleton instance of UserModel will be created
//as well
system.notify( 'Context#startup' );
```

### Dynamic and automapping

Dijon allows for extremely flexible and dynamic mappings. Hey, it's JavaScript...

```javascript
//we can map 'global' outlets
system.mapOutlet( 'userModel' );
//registers 'userModel' as an injection point in _all_ mapped objects to be satisfied with
//the instance of UserModel.
//meaning:
var foo = {
	userModel : undefined; //inject
}
system.injectInto( foo );
//foo.userModel now holds a reference to the UserModel instance

//as long as system.strictInjections is false Dijon will only inject globally mapped objects
//into members that _have_ a member with the correct name
//however if we do his
system.strictInjections = false;

var bar = {};
system.injectInto( bar );
//a 'userModel' member is automatically created inside 'bar' and now holds a reference to the
//UserModel instance

//But we can go even one step further, we can have outlets automatically mapped when an object
//is mapped
system.autoMapOutlets = true;

system.mapSingleton( 'someObject', SomeClass );
var foo = {};
system.injectInto( foo );
//foo.someObject now holds a reference to the singleton instance of SomeClass
```