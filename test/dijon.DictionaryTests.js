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
		dictionary = undefined;
	}
})

test( 'getValue unnamed', function(){
	var a = {};
	var b = {};
	dictionary.add( a, b );
	strictEqual( dictionary.getValue( a ), b, 'should be strictly equal')
})

test( 'hasValue unnamed', function(){
	var a = {};
	var b = {};
	dictionary.add( a, b );
	ok( dictionary.hasValue( a ) );
})

test( 'remove unnamed', function(){
	var a = {};
	var b = {};
	dictionary.add( a, b );
	dictionary.remove( a );
	ok( ! dictionary.hasValue( a ) );
})
