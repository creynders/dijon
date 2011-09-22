/**
 * Created by JetBrains WebStorm.
 * User: creynder
 * Date: 21/09/11
 * Time: 13:03
 * To change this template use File | Settings | File Templates.
 */

var dictionary;

module( 'dijon.Dictionary', {
	setup : function(){
		dictionary = new dijon.Dictionary();
	},
	teardown : function(){
		delete dictionary;
	}
})

test( 'getValue unnamed', function(){
	var a = {};
	var b = {};
	dictionary.add( a, b );
	strictEqual( dictionary.getValue( a ), b, 'should be strictly equal')
})

test( 'getValue named', function(){
	var a = {};
	var b = {};
	var name = 'foo';
	dictionary.add( a, b, name );
	strictEqual( dictionary.getValue( a, name ), b, 'should be strictly equal')
})

test( 'getValue differentiate between named and unnamed', function(){
	var a = {};
	var b = {};
	var c = {};
	var name = 'foo';
	dictionary.add( a, b, name );
	dictionary.add( a, c );
	strictEqual( dictionary.getValue( a, name ), b, 'should be strictly equal');
	strictEqual( dictionary.getValue( a ), c, 'should be strictly equal');
})

test( 'getValue unmapped values', function(){
	var a = {};
	var b = {};
	var c = {};
	var name = 'foo';
	dictionary.add( a, b, name );
	dictionary.add( b, c );
	strictEqual( dictionary.getValue( a ), null, 'should be strictly equal');
	strictEqual( dictionary.getValue( b, name ), null, 'should be strictly equal');
})

test( 'hasValue unnamed', function(){
	var a = {};
	var b = {};
	dictionary.add( a, b );
	ok( dictionary.hasValue( a ) );
	ok( ! dictionary.hasValue( a, 'foo' ) );
})

test( 'hasValue named', function(){
	var a = {};
	var b = {};
	var name = 'foo';
	dictionary.add( a, b, name );
	ok( dictionary.hasValue( a, name ) );
	ok( ! dictionary.hasValue( a ) );
})

test( 'remove unnamed', function(){
	var a = {};
	var b = {};
	dictionary.add( a, b );
	dictionary.remove( a );
	ok( ! dictionary.hasValue( a ) );
})

test( 'remove named', function(){
	var a = {};
	var b = {};
	var name = 'foo';
	dictionary.add( a, b, name );
	dictionary.remove( a, name );
	ok( ! dictionary.hasValue( a, name ) );
})

test( 'remove differentiate between named and unnamed', function(){
	var a = {};
	var b = {};
	var c = {};
	var name = 'foo';
	dictionary.add( a, b, name );
	dictionary.remove( a );
	ok( dictionary.hasValue( a, name ) );
	dictionary.add( a, c );
	dictionary.remove( a, name );
	strictEqual( dictionary.getValue( a ), c );
})

