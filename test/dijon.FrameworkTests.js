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
    context.init();
	ok( context.injector != undefined );
	ok( context.eventDispatcher != undefined );
	ok( context.eventMap != undefined );
});

//TODO: test Context#parseConfig

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
		eventMap.eventDispatcher = eventDispatcher;
		eventMap.injector = injector;
		commandMap = new dijon.CommandMap();
		commandMap.eventMap = eventMap;
		commandMap.injector = injector;
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
	var vo = {};
	commandMap.mapEvent( startedEvent, TestCommand );
	eventDispatcher.dispatchEvent( startedEvent, vo );
	var p = passed;
	strictEqual( vo, p );
} );

test( 'execute command', function(){
	commandMap.execute( TestCommand );
	equal( hasExecuted, 1 );
})

test( 'execute command with payload', function(){
	var vo = {};
	commandMap.execute( TestCommand, vo );
	var p = passed;
	equal( hasExecuted, 1 );
	strictEqual( vo, p );
})