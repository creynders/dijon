/** @namespace */
dijon = {
	VERSION : '0.2.0'
}

  //======================================//
 // dijon.Dictionary
//======================================//

/**
 @class Hash
 @author <a href="mailto:info@creynders.be">creynders</a>
 @constructor
 */
dijon.Dictionary = function(){
	this.qcn = 'dijon.Dictionary';
}
dijon.Dictionary.prototype._map = [];

dijon.Dictionary.prototype._getIndexByKey = function( key, name ){
	for( var i = 0, n = this._map.length ; i < n ; i++ ){
		if( this._map[ i ].key === key && this._map[ i ].name == name ) return i;
	}
	
	return -1;
}

/**
 * @param {Object} key
 * @param {Object} value
 * @param {String} name [optional]
 */
dijon.Dictionary.prototype.add = function( key, value, name ){
	var index = this._getIndexByKey( key, name );
	if( index < 0 ){
		this._map.push( {
			key : key,
			value : value,
			name : name
		});
	}else{
		this._map[ index ] = {
			key : key,
			value : value,
			name : name
		}
	}
}

/**
 * @param {Object} key
 * @param {String} name
 */
dijon.Dictionary.prototype.remove = function( key, name ){
	var index = this._getIndexByKey( key, name );
	if( index >= 0 ) return this._map.splice( index, 1 ).value;
	
	return null;
}

/**
 * @param {Object} key
 * @param {String} name
 */
dijon.Dictionary.prototype.getValue = function( key, name ){
	var index = this._getIndexByKey( key, name );
	
	if( index >= 0 ) return this._map[ index ].value;
	
	return null;
}

dijon.Dictionary.prototype.hasValue = function( key, name ){
	var index = this._getIndexByKey( key, name );
	return ( index >= 0 );
}


  //======================================//
 // dijon.SignalMap
//======================================//

/**
 @class dijon.SignalMap
 @author <a href="mailto:info@creynders.be">creynders</a>
 @constructor
*/
dijon.SignalMap = function(){
	this.qcn = 'dijon.SignalMap';
	
	this._map = [];
	
	/** @type dijon.Injector */
	this.injector = null;
}


/**
 * @param {signals.Signal} signal
 * @param {Function} callback
 * @param {Object} context [optional] defaults to global
 * @param {Boolean} oneShot [optional] defaults to false
 */
dijon.SignalMap.prototype.mapCallback = function( signal, callback, context, oneShot ){
	var binding = ( oneShot ) ? signal.addOnce( callback ) : signal.add( callback );
	if( context ) binding.context = context;
	return binding;
}

/**
 * @param {signals.Signal} signal
 * @param {Function} callback
 */
dijon.SignalMap.prototype.unmapCallback = function( signal, callback ){
	signal.remove( callback );
}

/**
 * @param {signals.Signal} signal
 * @param {Object} clazz
 * @param {Function} handler [optional] defaults to 'execute', falls back on constructor
 * @param {Boolean} oneShot [optional] defaults to false
 */
dijon.SignalMap.prototype.mapClass = function( signal, clazz, handler, oneShot ){
	if( ! this.injector.hasMapping( clazz ) ) this.injector.mapClass( clazz, clazz );
	var callback = function(){
		var instance = this.injector.getInstance( clazz, arguments );
		if( handler ) handler.apply( instance, arguments );
		else if( instance.execute ) instance.execute.apply( instance, arguments );
		
		if( oneShot ) this.unmapClass( signal, clazz, handler );
	}
	var binding = ( oneShot ) ? signal.addOnce( callback, this ) : signal.add( callback, this );
	this._map.push( { signal : signal, target : clazz, handler : handler, callback : callback } );
	return binding;
}

dijon.SignalMap.prototype.unmapClass = function( signal, clazz, handler ){
	for( var i = 0, n = this._map.length ; i < n ; i++ ){
		var mapping = this._map[ i ];
		if( mapping.signal === signal && mapping.target === clazz && mapping.handler === handler ){
			signal.remove( mapping.callback );
			this._map.splice( i, 1 );
			return;
		}
	}
}
