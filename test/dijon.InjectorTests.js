/**
 * Created by JetBrains WebStorm.
 * User: creynder
 * Date: 21/09/11
 * Time: 14:53
 * To change this template use File | Settings | File Templates.
 */
var injector;

function TestClassA(){
	this.name = 'TestClassA';
}

function TestClassB(){
	this.name = 'TestClassB';

	this.bar = undefined;
}

module( 'dijon.Injector', {
	setup : function(){
		injector = new dijon.Injector();
	},
	teardown : function(){
		delete injector;
	}
});

test( 'unnamed mapSingleton', function(){
	injector.mapSingleton( TestClassA );
	ok( injector.hasMapping( TestClassA ) );
})

test( 'unnamed mapValue', function(){
	var a = new TestClassA();
	injector.mapValue( TestClassA, a );
	ok( injector.hasMapping( TestClassA ) );
})

test( 'unnamed mapClass', function(){
	injector.mapClass( TestClassA, function(){} );
	ok( injector.hasMapping( TestClassA ) );
})

test( 'unnamed mapSingletonOf', function(){
	injector.mapSingletonOf( TestClassA, function(){} );
	ok( injector.hasMapping( TestClassA ) );
})

test( 'getInstance for unnamed mapSingleton', function(){
	injector.mapSingleton( TestClassA );
	var a = injector.getInstance( TestClassA );
	ok( a instanceof TestClassA );
	strictEqual( injector.getInstance( TestClassA ), a );
})

test( 'getInstance for unnamed mapSingletonOf', function(){
	injector.mapSingletonOf( TestClassA, TestClassB );
	var b = injector.getInstance( TestClassA );
	ok( b instanceof TestClassB );
	strictEqual( injector.getInstance( TestClassA ), b );
})

test( 'getInstance for mapClass', function(){
	injector.mapClass( TestClassA, TestClassB );
	var b = injector.getInstance( TestClassA );
	ok( b instanceof TestClassB );
	notStrictEqual( injector.getInstance( TestClassA ), b );
})

test( 'getInstance for mapValue', function(){
	var a = new TestClassA();
	injector.mapValue( TestClassA, a );
	strictEqual( injector.getInstance( TestClassA ), a );
})

test( 'instantiate for mapSingleton', function(){
	injector.mapSingleton( TestClassA );
	var a = injector.getInstance( TestClassA );
	notStrictEqual( injector.instantiate( TestClassA ), a );
})

test( 'instantiate for mapSingletonOf', function(){
	injector.mapSingletonOf( TestClassA, TestClassB );
	var b = injector.getInstance( TestClassA );
	notStrictEqual( injector.instantiate( TestClassA ), b );
})

test( 'instantiate for mapClass', function(){
	injector.mapClass( TestClassA, TestClassB );
	var b = injector.getInstance( TestClassA );
	notStrictEqual( injector.instantiate( TestClassA ), b );
})

test( 'instantiate for mapValue', function(){
	var a = new TestClassA();
	injector.mapValue( TestClassA, a );
	notStrictEqual( injector.instantiate( TestClassA ), a );
})

test( 'unnamed unmap', function(){
	injector.mapSingleton( TestClassA )
	injector.unmap( TestClassA );
	ok( ! injector.hasMapping( TestClassA ) );
})

test( 'addInjectionPoint', function(){
	injector.mapSingleton( TestClassA );
	injector.mapSingleton( TestClassB );
	injector.addInjectionPoint( TestClassB, 'bar', TestClassA );
	var b = injector.getInstance( TestClassB );
	ok( b.bar instanceof TestClassA );
})

test( 'removeInjectionPoint', function() {
	injector.mapSingleton( TestClassA );
	injector.mapSingleton( TestClassB );
	injector.addInjectionPoint( TestClassB, 'bar', TestClassA );
	injector.removeInjectionPoint( TestClassB, 'bar' );
	var b = injector.getInstance( TestClassB );
	strictEqual( b.bar, undefined );
})