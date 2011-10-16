/**
 * Created by JetBrains WebStorm.
 * User: creynder
 * Date: 22/09/11
 * Time: 14:50
 * To change this template use File | Settings | File Templates.
 */

this.eventMap;
var dispatcher;
var injector;
var started = 'started';
var isExecuted = 0;
var scope;

Test1 = function(){
};
Test1.prototype = {
	handler : function(){
		isExecuted++;
		scope = this;
	}
}

Test2 = function(){
	isExecuted++;
}


module( 'dijon.EventMap', {
		setup : function(){
			isExecuted = 0;
			scope = undefined;
			dispatcher = new dijon.EventDispatcher();
			injector = new dijon.Injector();
			eventMap = new dijon.EventMap();
			eventMap.eventDispatcher = dispatcher;
			eventMap.injector = injector;
		},
		teardown : function(){
			delete eventMap.dispatcher;
			delete eventMap.injector;
			eventMap = null;
			dispatcher = null;
			injector = null;
		}
	}
)

test( 'addRuledMapping standard', function(){
	injector.mapSingleton( Test1 );
	eventMap.addRuledMapping( started, Test1, 'handler' );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})

test( 'removeRuledMapping standard', function(){
	injector.mapSingleton( Test1 );
	eventMap.addRuledMapping( started, Test1, "handler" );
	eventMap.removeRuledMapping( started, Test1, "handler" );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 0 );
	ok( injector.hasMapping( Test1 ) );
})

test( 'addClassMapping standard', function(){
	eventMap.addClassMapping( started, Test1, "handler" );
	dispatcher.dispatchEvent( started );
	var firstScope = scope;
	equal( isExecuted, 1 );
	dispatcher.dispatchEvent( started );
	notStrictEqual( firstScope, scope );
})

test( 'removeClassMapping standard', function(){
	eventMap.addClassMapping( started, Test1, "handler" );
	eventMap.removeClassMapping( started, Test1, "handler" );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 0 );
	ok( ! injector.hasMapping( Test1 ) );
})

test( 'optional handler for addClassMapping', function(){
	eventMap.addClassMapping( started, Test2 );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})

test( 'hasMapping', function(){
	eventMap.addClassMapping( started, Test1, Test1.prototype.handler );
	ok( eventMap.hasMapping( started, Test1, Test1.prototype.handler ));
	ok( ! eventMap.hasMapping( started, Test1 ));
})

test( 'hasMapping with optional handler', function(){
	eventMap.addClassMapping( started, Test1 );
	ok( eventMap.hasMapping( started, Test1 ));
	ok( ! eventMap.hasMapping( started, Test1, Test1.prototype.handler ));
})