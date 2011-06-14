var injector;

module( 'Injector', {
	setup : function(){
		injector = new dijon.Injector();
	},
	teardown : function(){
		delete injector;
	}
} );
test( 'Injector#constructor', function(){
	notEqual( null, injector );
	notEqual( undefined, injector );
})
test( 'Injector#mapValue native type, unnamed', function(){
	var foo = 'bar';
	injector.mapValue( String, foo );
	var value = injector.getInstance( String )
	notEqual( null, value );
	notEqual( undefined, value );
	equal( value, foo );
	equal( injector.getInstance( String ), foo );
})
test( 'Injector#mapValue native type, named', function(){
	var foo = 'bar';
	injector.mapValue( String, foo, foo );
	//raises( injector.getInstance( String ) );
	var v1 = injector.getInstance( String, foo )
	notEqual( null, v1 );
	notEqual( undefined, v1 );
	equal( v1, foo );
	injector.mapValue( String, 'whatever', 'whatever' );
	var v2 = injector.getInstance( String, 'whatever' );
	notEqual( null, v2 );
	notEqual( undefined, v2 );
	notEqual( v2, v1 );
})
test( 'Injector#mapValue object', function(){
	var foo = {
		name : 'bar'
	}
	injector.mapValue( Object, foo );
	var value = injector.getInstance( Object )
	notEqual( null, value );
	notEqual( undefined, value );
	equal( value, foo );
	equal( injector.getInstance( Object ), foo );
	strictEqual( value, foo );
	foo.name = 'whatever';
	equal( value.name, foo.name );
});
test( 'Injector#mapSingleton', function(){
	var Foo = function() {
		name : 'bar'
	}
	injector.mapSingleton( Foo );
	var v1 = injector.getInstance( Foo );
	notEqual( null, v1 );
	notEqual( undefined, v1 );
	var v2 = injector.getInstance( Foo );
	strictEqual( v2, v1 );
	v1.name = 'changed';
	equal( v2.name, v1.name );
});
test( 'Injector#mapSingletonOf', function(){
	var Bar = function(){
		name : 'bar';
	};
	var Foo = function() {
	}
	injector.mapSingletonOf( Foo, Bar );
	var v1 = injector.getInstance( Foo );
	notEqual( null, v1 );
	notEqual( undefined, v1 );
	var v2 = injector.getInstance( Foo );
	strictEqual( v2, v1 );
	v1.name = 'changed';
	equal( v2.name, v1.name );
});
test( 'Injector#mapClass', function(){
	var Foo = function() {
		name : 'bar'
	}
	injector.mapClass( Foo, Foo );
	var v1 = injector.getInstance( Foo );
	notEqual( null, v1 );
	notEqual( undefined, v1 );
	var v2 = injector.getInstance( Foo );
	notEqual( v2, v1 );
	v1.name = 'changed';
	notEqual( v2.name, v1.name );
});
test( 'Injector#hasMapping', function(){
	var Bar = function(){
	};
	var Foo = function() {
	}
	injector.mapClass( Foo, Bar );
	ok( injector.hasMapping( Foo ) );
	ok( ! injector.hasMapping( Bar ) );
});
test( 'Injector#instantiate', function(){
	var Bar = function(){
	};
	var Foo = function(){
	};
	injector.mapSingleton( Foo );
	var singleton = injector.getInstance( Foo );
	var v1 = injector.instantiate( Foo );
	notEqual( null, v1 );
	notEqual( undefined, v1 );
	ok( v1 instanceof Foo );
	notEqual( v1, singleton, 'the two instances should not be equal' );
	var v2 = injector.instantiate( Foo );
	notEqual( null, v2 );
	notEqual( undefined, v2 );
	notEqual( v1, v2, 'the two instances should not be equal' );
	injector.mapSingletonOf( Foo, Bar );
	var v1 = injector.instantiate( Foo );
	notEqual( null, v1 );
	notEqual( undefined, v1 );
	ok( v1 instanceof Bar );
	var v2 = injector.instantiate( Foo );
	notEqual( null, v2 );
	notEqual( undefined, v2 );
	notEqual( v1, v2, 'the two instances should not be equal' );
});
test( 'Injector#addInjectionPoint', function(){
	var Bar = function(){
		this.foo = null;
	};
	var Foo = function(){
	};
	injector.mapSingleton( Foo );
	injector.addInjectionPoint( Bar, 'foo', Foo );
	injector.mapSingleton( Bar );
	var bar = injector.getInstance( Bar );
	notEqual( null, bar.foo );
	notEqual( undefined, bar.foo );
	ok( bar.foo instanceof Foo );
});
test( 'Injector#injectInto object', function(){
	var bar = {
		foo : null,
		something : null
	};
	var Foo = function(){
	};
	var text = 'else';
	injector.addInjectionPoint( Object, 'foo', Foo );
	injector.addInjectionPoint( Object, 'something', String );
	injector.mapValue( Object, bar );
	injector.mapValue( String, text );
	injector.mapSingleton( Foo );
	injector.injectInto( bar );
	notEqual( null, bar.foo );
	notEqual( undefined, bar.foo );
	ok( bar.foo instanceof Foo );
	
	var foo = injector.getInstance( Foo );
	strictEqual( bar.foo, foo );
	notEqual( null, bar.something );
	notEqual( undefined, bar.something );
	equal( bar.something, text );
});

test( 'Injector#unmap', function(){
	var Foo = function(){
	};
	injector.mapSingleton( Foo );
	injector.unmap( Foo );
	ok( ! injector.hasMapping( Foo ) );
});
test( 'Injector#removeInjectionPoint', function(){
	var Bar = function(){
		this.foo = null;
	};
	var Foo = function(){
	};
	injector.mapSingleton( Foo );
	injector.addInjectionPoint( Bar, 'foo', Foo );
	injector.removeInjectionPoint( Bar, 'foo', Foo );
	injector.mapSingleton( Bar );
	var bar = injector.getInstance( Bar );
	equal( null, bar.foo );
	equal( undefined, bar.foo );
});

/** @type dijon.Context */
var context;

module( 'Context', {
	setup : function(){
		context = new dijon.Context();
	},
	teardown : function(){
		delete context;
	}
} );

test( 'Context#constructor', function(){
	//notEqual( context, null );
	//notEqual( context, undefined );
	//console.log( context.injector );
	//notEqual( context.injector, null );
	var exists = ( context != null && context != undefined );
	ok( exists );
})


test( 'Context#getSignalMap', function(){
	var signalMap = context.getSignalMap();
	var exists = ( signalMap != null && signalMap != undefined );
	ok( exists )
	console.log( context );
})

/*
var signalMap;

module( 'SignalMap', {
	setup : function(){
		injector = new dijon.Injector();
		injector.mapSingleton( dijon.SignalMap );
		signalMap = injector.getInstance( dijon.SignalMap );
	},
	teardown : function(){
		delete injector;
	}
} );
test( 'SignalMap#mapCallback basic', function(){
	var n = 10;
	expect( n );
	var signal = new signals.Signal();
	var callback = function( iteration ){
		ok( true, 'callback is called #' + iteration );
	}
	signalMap.mapCallback( signal, callback );
	
	for( var i = 0 ; i < n ; i++ ){
		signal.dispatch( i+1 );		
	}
} );
test( 'SignalMap#mapCallback with oneShot', function(){
	var n = 10;
	expect( 1 );
	var signal = new signals.Signal();
	var callback = function( iteration ){
		ok( true, 'callback is called only once' );
	}
	signalMap.mapCallback( signal, callback, this, true );
	
	for( var i = 0 ; i < n ; i++ ){
		signal.dispatch( i+1 );		
	}
} );
var foo = 'global';
test( 'SignalMap#mapCallback with scope', function(){
	var signal = new signals.Signal();
	var obj = {
		foo : 'local'
	}
	signalMap.mapCallback( signal, function( blob ){
		notEqual( blob, this.foo );
	} );
	signalMap.mapCallback( signal, function( blob ){
		equal( blob, this.foo );
	}, obj );
	signal.dispatch( obj.foo );
} );

test( 'SignalMap#mapClass basic', function(){
	var n = 10;
	expect( n );
	var signal = new signals.Signal();
	var Foo = function(){
		ok( true, 'callback is called #' + iteration );
	}
	
	signalMap.mapClass( signal, Foo );
	
	for( var i = 0 ; i < n ; i++ ){
		signal.dispatch( i+1 );		
	}
} );
*/