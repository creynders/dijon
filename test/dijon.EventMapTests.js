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
var passedValue;
var passedEvent;

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
            passedValue = null;
            passedEvent = null;
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
	eventMap.addClassMapping( started, Test1, "handler" );
	ok( eventMap.hasMapping( started, Test1, "handler" ));
	ok( ! eventMap.hasMapping( started, Test1 ));
})

test( 'hasMapping with optional handler', function(){
	eventMap.addClassMapping( started, Test1 );
	ok( eventMap.hasMapping( started, Test1 ));
	ok( ! eventMap.hasMapping( started, Test1, "handler" ));
});

test( 'event object passing to listeners', function(){
    var passedValue;
    var passedEvent;
    var payload = {};
    var TestClass = function(){
        this.handler = function( event, foo ){
            passedValue = foo;
            passedEvent = event;
        }
    };
    eventMap.addClassMapping( started, TestClass, "handler", true, true );
    dispatcher.dispatchEvent( started, payload);
    strictEqual( passedEvent.type, started );
    strictEqual( payload, passedValue )
})

test( 'differentiation of passed values to listeners with different values for passEvent', function(){
    var passedValue1, passedValue2, passedEvent;
    var payload = {};
    var TestClass = function(){
        this.handler1 = function( event, foo ){
            passedValue1 = foo;
            passedEvent = event;
        }
        this.handler2 = function( bar ){
            passedValue2 = bar;
        }
    }
    eventMap.addClassMapping( started, TestClass, "handler1", true, true );
    eventMap.addClassMapping( started, TestClass, "handler2", true, false );
    dispatcher.dispatchEvent( started, payload);

    strictEqual( passedEvent.type, started );
    strictEqual( payload, passedValue1 );
    strictEqual( payload, passedValue2 );
})

test( 'oneShot listener gets removed', function(){
    eventMap.addClassMapping( started, Test2, null, true );
    dispatcher.dispatchEvent( started);
    ok( ! eventMap.hasMapping( started, Test2 ) );
})

test( 'oneShot doesnt prevent next listener to be called', function(){
    eventMap.addClassMapping( started, Test1, "handler", true );
    eventMap.addClassMapping( started, Test2, null, false );

    dispatcher.dispatchEvent( started);
    equal( isExecuted, 2 );
})