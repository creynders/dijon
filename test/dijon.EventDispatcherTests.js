var dispatcher;

module( 'dijon.EventDispatcher', {
		setup : function(){
			dispatcher = new dijon.EventDispatcher();
		},
		teardown : function(){
			delete dispatcher;
		}
	}
)

test( 'standard usage', function(){
	var isExecuted = false;
	var event = 'start';
	dispatcher.addListener( event, function(){
		isExecuted = true;
	});
	dispatcher.dispatchEvent( event );
	ok( isExecuted, "listener should've been called" );
	equal( dispatcher.length(), 1, 'dispatcher should have exactly one listener' );
} );

test( 'standard oneShot', function(){
	var isExecuted = false;
	var event = 'start';
	dispatcher.addListener( event, function(){
		isExecuted = true;
	}, true);
	dispatcher.dispatchEvent( event );
	ok( isExecuted, "listener should've been called" );
	equal( dispatcher.length(), 0, 'dispatcher should have no listeners' );
	isExecuted = false;
	dispatcher.dispatchEvent( event );
	ok( ! isExecuted, 'listener should NOT have been re-called' );	
});

test( 'oneShot automatic listener removal from front of queue', function(){
	var isExecuted = 0;
	var event = 'start';
	var listener = function(){
		isExecuted++;
	};
	dispatcher.addListener( event, listener, true);
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 6, "listener should've been called exactly 6 times" );
	equal( dispatcher.length(), 5, 'dispatcher should have exactly 5 listeners' );
	isExecuted = 0;
	dispatcher.dispatchEvent( event );
	equal( dispatcher.length(), 5, 'dispatcher should have exactly 5 listeners' );
});

test( 'oneShot automatic listener removal from end of queue', function(){
	var isExecuted = 0;
	var event = 'start';
	var listener = function(){
		isExecuted++;
	};
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener, true);
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 6, "listener should've been called exactly 6 times" );
	equal( dispatcher.length(), 5, 'dispatcher should have exactly 5 listeners' );
	isExecuted = 0;
	dispatcher.dispatchEvent( event );
	equal( dispatcher.length(), 5, 'dispatcher should have exactly 5 listeners' );
});

test( 'oneShot automatic listener removal from middle of queue', function(){
	var isExecuted = 0;
	var event = 'start';
	var listener = function(){
		isExecuted++;
	};
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener, true);
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 6, "listener should've been called exactly 6 times" );
	equal( dispatcher.length(), 5, 'dispatcher should have exactly 5 listeners' );
	isExecuted = 0;
	dispatcher.dispatchEvent( event );
	equal( dispatcher.length(), 5, 'dispatcher should have exactly 5 listeners' );
});

test( 'multiple oneShot', function(){
	var isExecuted = 0;
	var event = 'start';
	var listener = function(){
		isExecuted++;
	};
	dispatcher.addListener( event, listener, true);
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener, true);
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener, true);
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 6, "listener should've been called exactly 6 times" );
	equal( dispatcher.length(), 3, 'dispatcher should have exactly 3 listeners' );
	isExecuted = 0;
	dispatcher.dispatchEvent( event );
	equal( dispatcher.length(), 3, 'dispatcher should have exactly 3 listeners' );
});

test( 'oneShot non-recursion', function(){
	var isExecuted = 0;
	var event = 'start';
	var listener = function(){
		isExecuted++;
		dispatcher.dispatchEvent( event );
	};
	dispatcher.addListener( event, listener, true);
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 1, "listener should've been called exactly 1 time" );
});

test( 'scoped usage', function(){
	var scope;
	var event = 'start';
	var listener = {
		handler : function(){
			scope = this;
		}
	}
	dispatcher.addScopedListener( event, listener.handler, listener, true);
	dispatcher.dispatchEvent( event );
	strictEqual( scope, listener, "called scope should be listener" );
});

test( 'standard removeListener', function(){
	var event = 'start';
	var isExecuted = 0;
	var listener = function(){
		isExecuted++;
	}
	dispatcher.addListener( event, listener );
	dispatcher.dispatchEvent( event );
	dispatcher.removeListener( event, listener );
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 1, "listener should've been called exactly 1 time" );
	equal( dispatcher.length(), 0, 'dispatcher should have no listeners' );

});

test( 'scoped removeListener', function(){
	var event = 'start';
	var isExecuted = 0;
	var listener = {
		handler : function(){
			isExecuted++;
		}
	}
	dispatcher.addScopedListener( event, listener.handler, listener );
	dispatcher.dispatchEvent( event );
	dispatcher.removeScopedListener( event, listener.handler, listener );
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 1, "listener should've been called exactly 1 time" );
	equal( dispatcher.length(), 0, 'dispatcher should have no listeners' );

});

test( 'remove all listeners', function(){
	var isExecuted = 0;
	var event = 'start';
	var listener = function(){
		isExecuted++;
	};
	dispatcher.addListener( event, listener, true);
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener, true);
	dispatcher.addListener( event, listener );
	dispatcher.addListener( event, listener );
	dispatcher.removeAllListeners();
	dispatcher.dispatchEvent( event );
	equal( isExecuted, 0, "listener should not 've been called" );
	equal( dispatcher.length(), 0, 'dispatcher should have exactly 0 listeners' );
});
