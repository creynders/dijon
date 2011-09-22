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
	},
}


module( 'dijon.EventMap', {
		setup : function(){
			isExecuted = 0;
			scope = undefined;
			dispatcher = new dijon.EventDispatcher();
			injector = new dijon.Injector();
			eventMap = new dijon.EventMap();
			eventMap.dispatcher = dispatcher;
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

test( 'addFunctionMapping standard', function(){
	var handler = function(){
		isExecuted++;
	}
	eventMap.addFunctionMapping( started, handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})

test( 'removeFunctionMapping', function(){
	var handler = function(){
		isExecuted++;
	}
	eventMap.addFunctionMapping( started, handler );
	dispatcher.dispatchEvent( started );
	eventMap.removeFunctionMapping( started, handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})

test( 'addObjectMapping standard', function(){
	var a = {
		handler : function(){
			isExecuted++;
		}
	}
	eventMap.addObjectMapping( started, a, a.handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})


test( 'removeObjectMapping', function(){
	var a = {
		handler : function(){
			isExecuted++;
		}
	}
	eventMap.addObjectMapping( started, a, a.handler );
	dispatcher.dispatchEvent( started );
	eventMap.removeObjectMapping( started, a, a.handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})

test( 'removeObjectMapping multiple handlers persistence', function(){
	var a = {
		foo : function(){
			isExecuted++;
		},
		bar : function(){
			isExecuted++;
		}
	}
	eventMap.addObjectMapping( started, a, a.foo );
	eventMap.addObjectMapping( started, a, a.bar );
	dispatcher.dispatchEvent( started );
	eventMap.removeObjectMapping( started, a, a.foo );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 3 );
})

test( 'addRuledMapping standard', function(){
	injector.mapSingleton( Test1 );
	eventMap.addRuledMapping( started, Test1, Test1.prototype.handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 1 );
})

test( 'removeRuledMapping standard', function(){
	injector.mapSingleton( Test1 );
	eventMap.addRuledMapping( started, Test1, Test1.prototype.handler );
	eventMap.removeRuledMapping( started, Test1, Test1.prototype.handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 0 );
	ok( injector.hasMapping( Test1 ) );
})

test( 'addSingletonMapping standard', function(){
	eventMap.addSingletonMapping( started, Test1, Test1.prototype.handler );
	dispatcher.dispatchEvent( started );
	var firstScope = scope;
	equal( isExecuted, 1 );
	dispatcher.dispatchEvent( started );
	strictEqual( firstScope, scope );
})

test( 'removeSingletonMapping standard', function(){
	eventMap.addSingletonMapping( started, Test1, Test1.prototype.handler );
	eventMap.removeSingletonMapping( started, Test1, Test1.prototype.handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 0 );
	ok( ! injector.hasMapping( Test1 ) );
})

test( 'addClassMapping standard', function(){
	eventMap.addClassMapping( started, Test1, Test1.prototype.handler );
	dispatcher.dispatchEvent( started );
	var firstScope = scope;
	equal( isExecuted, 1 );
	dispatcher.dispatchEvent( started );
	notStrictEqual( firstScope, scope );
})

test( 'removeClassMapping standard', function(){
	eventMap.addClassMapping( started, Test1, Test1.prototype.handler );
	eventMap.removeClassMapping( started, Test1, Test1.prototype.handler );
	dispatcher.dispatchEvent( started );
	equal( isExecuted, 0 );
	ok( ! injector.hasMapping( Test1 ) );
})