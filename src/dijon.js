/** @namespace */
dijon = {
	VERSION : '0.2.0'
}

dijon.qualifiers = {
	injector : {},
	context : {},
	signalMap : {},
}

  //======================================//
 // dijon.MinimumArgumentsError
//======================================//

/**
 @class dijon.MinimumArgumentsError
 @author <a href="mailto:info@creynders.be">creynders</a>
 @constructor
*/
dijon.MinimumArgumentsError = function( classQCN, methodName, minArgsLength ){
	this.qcn = 'dijon.MinimumArgumentsError';
	this.message = classQCN + '#' + methodName + " needs at least " + minArgsLength + " argument(s)."
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
 // dijon.Injector
//======================================//

/**
 @class dijon.Injector
 @author info@creynders.be
 @constructor
*/
dijon.Injector = function(){
	this.qcn = 'dijon.Injector';
	
	this._mappings = new dijon.Dictionary();
	this._injectionPoints = new Array();
}

/** @private */
dijon.Injector.prototype._createInstance = function( clazz ){
    var instance = new clazz();
	this.injectInto( instance );
    if( "setup" in instance ) instance.setup.call( instance );
    return instance;
}

dijon.Injector.prototype.addInjectionPoint = function( target, property, clazz, name ){
	var minArgsLength = 3;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "addInjectionPoint", minArgsLength );
	this._injectionPoints.push( {
		target : target,
		property : property,
		name : name,
		clazz : clazz
	} );
}

dijon.Injector.prototype._doGetInstance = function( clazz, name, overrideSingleton ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "getInstance", minArgsLength );
	var value = this._mappings.getValue( clazz, name );
	var output = null;
	if( value ){
		//found
		if( value.isSingleton && ! overrideSingleton ){
			if( value.object == null ){
				 value.object = this._createInstance( value.clazz );
			}
			output = value.object;
		}else{
			output = this._createInstance( value.clazz );            
		}
	}else{
		throw new Error( this.qcn + " is missing a rule for " + clazz );        
	}
	return output;
}

/**
Create or retrieve an instance of the given class
@returns {Object} an instance of the object mapped to <code>classRef</code>
*/
dijon.Injector.prototype.getInstance = function( clazz, name ){
	return this._doGetInstance( clazz, name, false );
}

/**
When asked for an instance of the class <code>whenAskedFor</code> inject an (- the only -) instance of <code>whenAskedFor</code>.
@param {Object} whenAskedFor
@returns {null}
*/
dijon.Injector.prototype.mapSingleton = function( whenAskedFor, name ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "mapSingleton", minArgsLength );
	this.mapSingletonOf( whenAskedFor, whenAskedFor, name );
}

/**
When asked for an instance of the class <code>whenAskedFor</code> inject the instance <code>useValue</code>.
@param {Object} whenAskedFor
@param {Object} useValue
@returns {Object} passes <code>useValue</code> through
*/
dijon.Injector.prototype.mapValue = function( whenAskedFor, useValue, name ){
	var minArgsLength = 2;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "mapValue", minArgsLength );
	this._mappings.add(
		whenAskedFor,
		{
			clazz : null, 
			object : useValue,
			isSingleton : true
		},
		name
	);
}

/**
Does a rule exist to satsify such a request?
@param {Object} rule
@returns {Boolean}
*/
dijon.Injector.prototype.hasMapping = function( whenAskedFor, name ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "hasMapping", minArgsLength );
	return this._mappings.hasValue( whenAskedFor, name );
}

/**
When asked for an instance of the class <code>whenAskedFor</code> inject a <b>new</b> instance of <code>instantiateClass</code>.
@param {Object} whenAskedFor
@param {Object} instantiateClass
@returns {null}
*/
dijon.Injector.prototype.mapClass = function( whenAskedFor, instantiateClass, name ){
	var minArgsLength = 2;
	if( arguments.length < minArgsLength ) throw new dijon.MinimumArgumentsError( this.qcn, "mapClass", minArgsLength );
	this._mappings.add(
		whenAskedFor,
		{
			clazz : instantiateClass, 
			object : null,
			isSingleton : false
		},
		name
	);
}

/**
When asked for an instance of the class <code>whenAskedFor</code> inject an instance of <code>useSingletonOf</code>.
@param {Object} whenAskedFor
@param {Object} useSingletonOf
@returns {null}
*/
dijon.Injector.prototype.mapSingletonOf = function( whenAskedFor, useSingletonOf, name ){
	var minArgsLength = 2;
	if( arguments.length < minArgsLength ) throw new dijon.MinimumArgumentsError( this.qcn, "mapSingletonOf", minArgsLength );
	this._mappings.add(
		whenAskedFor,
		{
			clazz : useSingletonOf, 
			object : null,
			isSingleton : true
		},
		name
	);
}

/**
creates an instance of <code>whenAskedFor</code>.
Is a wrapper for getInstance, w/o return, just to create a semantic difference.
@param {Object} whenAskedFor
@returns {null}
*/
dijon.Injector.prototype.instantiate = function( clazz, name ){
	return this._doGetInstance( clazz, name, true );
}

dijon.Injector.prototype.injectInto = function( instance ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "injectInto", minArgsLength );
	for( var i = 0, n = this._injectionPoints.length ; i < n ; i++ ){
		var mapping = this._injectionPoints[ i ];
		if( instance && instance instanceof mapping.target && mapping.property in instance ) instance[ mapping.property ] = this.getInstance( mapping.clazz, mapping.name );
	}	
}

dijon.Injector.prototype.unmap = function( whenAskedFor, name ){
	this._mappings.remove( whenAskedFor, name );
}

dijon.Injector.prototype.removeInjectionPoint = function( target, property, clazz, name ){
	for( var i = 0, n = this._injectionPoints.length ; i < n ; i++ ){
		var point = this._injectionPoints[ i ];
		if( point.target == target && point.property == property && point.clazz == clazz && point.name == name ) {
			this._injectionPoints.splice( i, 1 );
			return;
		}
	}
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
 * @param {Object} scope [optional] defaults to global
 * @param {Boolean} oneShot [optional] defaults to false
 */
dijon.SignalMap.prototype.mapCallback = function( signal, callback, scope, oneShot ){
	var binding = ( oneShot ) ? signal.addOnce( callback ) : signal.add( callback );
	if( scope ) binding.context = scope;
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
		var instance = this.injector.getInstance( clazz );
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

  //======================================//
 // dijon.Context
//======================================//

/**
 @class dijon.Context
 @author <a href="mailto:info@creynders.be">creynders</a>
 @constructor
*/
dijon.Context = function(){
	this.qcn = 'dijon.Context';
	
	this._injector = null;
	this._signalMap = null;
	
	this._init = function(){
		this._injector = new dijon.Injector();
		
		this._mapInjectionPoints();
		this._mapDependencies();
		this._instantiateDependencies();
	}
	
	this._mapInjectionPoints = function(){
		this._injector.addInjectionPoint( dijon.Context, 'signalMap', dijon.qualifiers.signalMap );
		this._injector.addInjectionPoint( dijon.SignalMap, 'injector', dijon.qualifiers.injector );
	}
	
	
	this._mapDependencies = function(){
		this._injector.mapValue( dijon.qualifiers.injector, this._injector );
		this._injector.mapSingletonOf( dijon.qualifiers.signalMap, dijon.SignalMap );
	}
	
	
	this._instantiateDependencies = function(){
		//this.injector.injectInto( this );
	}
	
	this._init();
}

/**
 * @returns {dijon.qualifiers.signalMap}
 */
dijon.Context.prototype.getSignalMap = function(){
	if( this._signalMap == null || this._signalMap == undefined ) this._signalMap = this._injector.getInstance( dijon.qualifiers.signalMap );
	return this._signalMap;
}