/**
 * Date: 26/09/11
 * Time: 16:01
 * @author Camille Reynders
 */

/**
 * @type dijon.Context
 */
var context;

module( 'dijon.Context', {
	setup : function(){
		context = new dijon.Context();
	},
	teardown : function(){
		context = undefined;
	}
});

test( 'auto instantiated members', function(){
	ok( context.injector != undefined );
	ok( context.eventDispatcher != undefined );
	ok( context.eventMap != undefined );
});

/** @type dijon.CommandMap */
var commandMap;
/** @type dijon.Injector */
var injector;
/** @type dijon.EventDispatcher */
var eventDispatcher;
/** @type dijon.EventMap */
var eventMap;
var startedEvent = 'startedEvent';
var hasExecuted = 0;
var passed;

function TestCommand(){
}
TestCommand.prototype = {
	execute : function( payload ){
		hasExecuted++;
		passed = payload;
	}
}

module( 'dijon.CommandMap', {
	setup : function(){
		injector = new dijon.Injector();
		eventDispatcher = new dijon.EventDispatcher();
		eventMap = new dijon.EventMap();
		eventMap.dispatcher = eventDispatcher;
		eventMap.injector = injector;
		commandMap = new dijon.CommandMap();
		commandMap.eventMap = eventMap;
		hasExecuted = 0;
	},
	teardown : function(){
		delete commandMap.eventMap;
		commandMap = undefined;
		delete eventMap.dispatcher;
		delete eventMap.injector;
		eventMap = undefined;
		injector = undefined;
	}
});

test( 'mapEvent', function(){
	commandMap.mapEvent( startedEvent, TestCommand );
	eventDispatcher.dispatchEvent( startedEvent );
	equal( hasExecuted, 1 );
} );

test( 'mapEvent with payload', function(){
	var vo = 'foo';
	commandMap.mapEvent( startedEvent, TestCommand );
	eventDispatcher.dispatchEvent( startedEvent, vo );
	//var p = passed;
	equal( hasExecuted, 1 );
} );
