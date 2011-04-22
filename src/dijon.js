/** @namespace */
dijon = {}

dijon.enforceInterface = function( targetObj, interfaceClass ){
	var interfaceObj = new interfaceClass();
	for( member in interfaceObj ){
		if( ! member in targetObj ) throw targetObj.toString() + " needs to implement all members of interface " + interfaceObj.toString();
	}
}

dijon.interfaceInstantiationError = function( qcn ){
	return qcn + ' is an interface and should not be instantiated';
}

dijon.interfaceMethodCallError = function( qcn, methodName ){
	return qcn + '#' + methodName + ' is an interface method and should not be called.';
}

dijon.minimumArgumentsError = function( qcn, methodName, minArgsLength ){
	return qcn + '#' + methodName + " needs at least " + minArgsLength + " argument(s)."
}

dijon.abstractMethodCallError = function( qcn, methodName ){
	return qcn + '#'  + methodName + ' is an abstract method and must be overridden.';
}

  //======================================//
 // dijon.Actor
//======================================//

/**
 @class dijon.Actor
 @author info@creynders.be
 @constructor
*/
dijon.Actor = function(){
	this.qcn = 'dijon.Actor';
	
	/** @type dijon.IEventDispatcher */
	this.dispatcher = null;

}

/**
 * @param {String} event
 */
dijon.Actor.prototype.dispatch = function( event ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "dispatch", minArgsLength );
	var args = [];
	for( var i = 1, n = arguments.length; i < n ; i++ ){
		args.push( arguments[ i ] );
	}
	this.dispatcher.dispatchEvent( event, args );
}

dijon.Actor.prototype.setup = function(){
	throw dijon.abstractMethodCallError( this.qcn, 'setup' );
}

dijon.Actor.prototype.teardown = function(){
	throw dijon.abstractMethodCallError( this.qcn, 'teardown' );
}


  //======================================//
 // dijon.Command
//======================================//

/**
 @class dijon.Command
 @author info@creynders.be
 @extends dijon.Actor
 @constructor
*/
dijon.Command = function(){
	this.qcn = 'dijon.Command';
	
	/** @type dijon.ICommandMap */
	this.commandMap = null;
	
	/** @type dijon.IInjector */
	this.injector = null;
}
dijon.Command.prototype = new dijon.Actor();
dijon.Command.prototype.constructor = dijon.Command;



/** @param {String} event [optional] */
dijon.Command.prototype.execute = function( event ){
	throw dijon.abstractMethodCallError( this.qcn, 'execute' );
}

  //======================================//
 // dijon.ICommandMap
//======================================//

/**
 Interface
 @class dijon.ICommandMap
 @author info@creynders.be
 @constructor
*/
dijon.ICommandMap = function(){
	this.qcn = 'dijon.ICommandMap';
	throw dijon.interfaceInstantiationError( this.qcn );
	
	/** @type dijon.IInjector */
	this.injector = null;
}

/** @param {dijon.Command} command */
dijon.ICommandMap.prototype.detain = function( command ){
	throw dijon.interfaceMethodCallError( this.qcn, 'detain' );		
}

/** @param {dijon.Command} command */
dijon.ICommandMap.prototype.execute = function( command ){
	throw dijon.interfaceMethodCallError( this.qcn, 'execute' );		
}

/**
 * @param {String} event
 * @param {Object} commandClass
 * @returns {Boolean}
 */
dijon.ICommandMap.prototype.hasMapping = function( event, commandClass ){
	throw dijon.interfaceMethodCallError( this.qcn, 'hasMapping' );	
}

/**
 * @param {String} event
 * @param {Function} commandClass
 * @param {Boolean} oneShot [optional]
 */
dijon.ICommandMap.prototype.mapEvent = function( event, commandClass, oneShot ){
	throw dijon.interfaceMethodCallError( this.qcn, 'mapEvent' );		
}

/** @param {dijon.Command} command */
dijon.ICommandMap.prototype.release = function( command ){
	throw dijon.interfaceMethodCallError( this.qcn, 'release' );		
}

/**
 * @param {String} event
 * @param {Function} commandClass
 */
dijon.ICommandMap.prototype.unmapEvent = function( event, commandClass ){
	throw dijon.interfaceMethodCallError( this.qcn, 'unmapEvent' );		
}


  //======================================//
 // dijon.CommandMap
//======================================//

/**
 @class dijon.CommandMap
 @author info@creynders.be
 @extends dijon.Actor
 @constructor
*/
dijon.CommandMap = function(){
	this.qcn = 'dijon.CommandMap';
	
	dijon.enforceInterface( this, dijon.ICommandMap );
	
	/** @type dijon.IInjector */
	this.injector = null;
	
	this._detainedCommands = new dijon.Dictionary();
	
	this._mappedCommands = new dijon.Dictionary();
}
dijon.CommandMap.prototype = new dijon.Actor();
dijon.CommandMap.prototype.constructor = dijon.CommandMap;

/** @param {dijon.Command} command */
dijon.CommandMap.prototype.detain = function( command ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "detain", minArgsLength );
	
	this._detainedCommands.add( command, true );
}

/** @param {Function} command */
dijon.CommandMap.prototype.execute = function( commandClass ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "execute", minArgsLength );
	
	var command = this.injector.getInstance( commandClass );
	command.execute();
}

/**
 * @param {String} event
 * @param {Function} commandClass
 * @returns {Boolean}
 */
dijon.CommandMap.prototype.hasMapping = function( event, commandClass ){
	var minArgsLength = 2;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "hasMapping", minArgsLength );
	
	if( this._mappedCommands.hasValue( event ) ){
		var list = this._mappedCommands.getValue( event );
		for( var i = 0, n = list.length ; i < n ; i++ ){
			if( list[ i ] == commandClass ) return true;
		}
	}
	
	return false;
}

/**
 * @param {String} event
 * @param {Function} commandClass
 * @param {Boolean} oneShot [optional]
 */
dijon.CommandMap.prototype.mapEvent = function( event, commandClass, oneShot ){
	var minArgsLength = 2;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "mapEvent", minArgsLength );
	if( oneShot == undefined ) oneShot = false;
	
	if( ! this.injector.hasMapping( commandClass ) ){
		this.injector.mapClass( commandClass, commandClass );
	}
	
	if( ! this._mappedCommands.hasValue( event ) ){
		this._mappedCommands.add( event, [] );
	}
	this._mappedCommands.getValue( event ).push( commandClass );
	
	this.dispatcher.addEventListener( event, this, this._onEventDispatched, oneShot )
}

dijon.CommandMap.prototype._onEventDispatched = function( event ){
	var args = [];
	for( var i = 0, n = arguments.length; i < n ; i++ ){
		args.push( arguments[ i ] );
	}
	var commands = this._mappedCommands.getValue( event );
	for( var i = 0, n = commands.length ; i < n ; i++ ){
		var commandClass = commands[ i ];
		var command = this.injector.getInstance( commandClass );
		command.execute.apply( command, args );
	}

}

/** @param {dijon.Command} command */
dijon.CommandMap.prototype.release = function( command ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "release", minArgsLength );

	this._detainedCommands.remove( command );
}

/**
 * @param {String} event
 * @param {Function} commandClass
 */
dijon.CommandMap.prototype.unmapEvent = function( event, commandClass ){
	var minArgsLength = 2;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "unmapEvent", minArgsLength );

	/** @type Array */
	var commands = this._mappedCommands.getValue( event );
	var n = commands.length
	for( var i = 0 ; i < n ; i++ ){
		if( commands[ i ] == commandClass ) {
			commands.splice( i, 1 );
			break;
		}
	}
	
	//TODO: if commandClass not found
	
	if( i < n && commands.length == 0 ){
		//last for that event type
		this.dispatcher.removeEventListener( event, this._onEventDispatched );
		this._mappedCommands.remove( event );
	}
}

  //======================================//
 // dijon.IContext
//======================================//

/**
 Interface
 @class dijon.IContext
 @author info@creynders.be
 @constructor
*/
dijon.IContext = function(){
	this.qcn = 'dijon.IContext';
	throw dijon.interfaceInstantiationError( this.qcn );
	
	/** @type dijon.EventDispatcher */
	this.dispatcher = null;
}

  //======================================//
 // dijon.Context
//======================================//

/**
 @class dijon.Context
 @author info@creynders.be
 @extends dijon.Actor
 @constructor
*/
dijon.Context = function( autoStartup ){
	this.qcn = 'dijon.Context';
	dijon.enforceInterface( this, dijon.IContext );
	
	if( autoStartup == undefined ) autoStartup = true;
	
	this._autoStartup = autoStartup;
	
	/** @type dijon.IEventDispatcher */
	this.dispatcher = null;
	
	/** @type dijon.ICommandMap */
	this.commandMap = null;
	
	/** @type dijon.IInjector */
	this.injector = null;
	
	this._mapInjections();
}
dijon.Context.prototype = new dijon.Actor();
dijon.Context.prototype.constructor = dijon.Context;

dijon.Context.prototype._mapInjections = function(){
	var injector = this.createInjector();
	
	injector.addInjectionPoint( dijon.Actor, 'dispatcher', dijon.IEventDispatcher );
	injector.addInjectionPoint( dijon.Actor, 'injector', dijon.IInjector );
	injector.addInjectionPoint( dijon.Command, 'commandMap', dijon.ICommandMap );
	
	injector.mapValue( dijon.IEventDispatcher, this.createDispatcher() );
	injector.mapValue( dijon.ICommandMap, this.createCommandMap() );
	injector.mapValue( dijon.IInjector, injector );
}

dijon.Context.prototype.createDispatcher = function(){
	if( this.dispatcher == undefined ) this.dispatcher = new dijon.EventDispatcher();
	return this.dispatcher;
}

dijon.Context.prototype.createInjector = function(){
	if( this.injector == undefined ) this.injector = new dijon.Injector();
	return this.injector;
}

dijon.Context.prototype.createCommandMap = function(){
	if( this.commandMap == undefined ) this.commandMap = new dijon.CommandMap();
	return this.commandMap;
}


dijon.Context.prototype.shutdown = function(){
	throw dijon.abstractMethodCallError( this.qcn, 'shutdown' );
}

dijon.Context.prototype.startup = function(){
	throw dijon.abstractMethodCallError( this.qcn, 'startup' );
}

  //======================================//
 // dijon.ContextEvent
//======================================//

/**
 @class dijon.ContextEvent
 @author info@creynders.be
 @constructor
*/
dijon.ContextEvent = {
	shutdown : 'dijon.ContextEvent#shutdown',
	shutdownComplete : 'dijon.ContextEvent#shutdownComplete',
	startup : 'dijon.ContextEvent#startup',
	startupComplete : 'dijon.ContextEvent#startupComplete'
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
 // dijon.IEventDispatcher
//======================================//

/**
 Interface
 @class dijon.IEventDispatcher
 @author info@creynders.be
 @constructor
*/
dijon.IEventDispatcher = function(){
	this.qcn = 'dijon.IEventDispatcher';
	throw dijon.interfaceInstantiationError( this.qcn );
}

/**
	adds a handler to be invoked when an event is dispatched
	@param {String} event The name of the event to be listened to
	@param {Object} target object scope where the listener must be invoked
	@param {Function} handler The handler to be called when the event has been dispatched
	@param {Boolean} oneShot Whether the listener must be called only once, default <code>false</code>
	@return {Number} The number of listeners
*/
dijon.IEventDispatcher.prototype.addEventListener = function( event, target, handler, oneShot ) {
	throw dijon.interfaceMethodCallError( this.qcn, 'addEventListener' );		
}

/**
	removes a handler from invocation when an event is dispatched
	@param {String} event The name of the event to be listened to
	@param {Function} handler The handler to be called when the event has been dispatched
	@return {Boolean} Success of removal
*/
dijon.IEventDispatcher.prototype.removeEventListener = function( event, target, handler ) {
	throw dijon.interfaceMethodCallError( this.qcn, 'removeEventListener' );		
}

/**
	dispatches an event with any number of arguments [0;n]
	@param {String} event The name of the event to be dispatched
	@param ... Any number of parameters
	@return {String} The event name
*/
dijon.IEventDispatcher.prototype.dispatchEvent = function( event ){
	throw dijon.interfaceMethodCallError( this.qcn, 'dispatchEvent' );		
}

/**
	removes all event listeners
	@return {null}
*/
dijon.IEventDispatcher.prototype.removeAllEventListeners = function(){
	throw dijon.interfaceMethodCallError( this.qcn, 'removeAllEventListeners' );		
}

/**
	Returns the number of listeners
	@return {Number} The number of listeners
*/
dijon.IEventDispatcher.prototype.length = function(){
	throw dijon.interfaceMethodCallError( this.qcn, 'length' );		
}

  //======================================//
 // dijon.EventDispatcher
//======================================//

/**
 @class dijon.EventDispatcher
 @author info@creynders.be
 @constructor
*/
dijon.EventDispatcher = function(){
	this.qcn = 'dijon.EventDispatcher';
	
	this._listeners = new dijon.Dictionary();
    this._length = 0;

}

dijon.EventDispatcher.prototype._removeListenerByIndex = function( event, index ){
	this._listeners.getValue( event ).splice( index, 1 );
	this._length--;
}

/**
	adds a handler to be invoked when an event is dispatched
	@param {String} event The name of the event to be listened to
	@param {Object} target object scope where the listener must be invoked
	@param {Function} handler The handler to be called when the event has been dispatched
	@param {Boolean} oneShot Whether the listener must be called only once, default <code>false</code>
	@return {Number} The number of listeners
*/
dijon.EventDispatcher.prototype.addEventListener = function( event, target, handler, oneShot ) {
	var minArgsLength = 3;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "addEventListener", minArgsLength );
	
	if( oneShot == undefined ) oneShot = false;
	if( ! this._listeners.hasValue( event ) ){
		this._listeners.add( event, new Array() );
	}
	this._listeners.getValue( event ).push( { 
		target : target,
		handler : handler, 
		oneShot : oneShot  
	} );
	return ++this._length;
}

/**
	removes a handler from invocation when an event is dispatched
	@param {String} event The name of the event to be listened to
	@param {Function} handler The handler to be called when the event has been dispatched
	@return {Boolean} Success of removal
*/
dijon.EventDispatcher.prototype.removeEventListener = function( event, target, handler ) {
	var minArgsLength = 3;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "removeEventListener", minArgsLength );
	var l = this._length;
	var list = this._listeners.getValue( event );
	for ( var i = 0, n = list.length; i < n ; i++ ){
		var obj = list[ i ];
		if( obj.target==target && obj.handler == handler ){
			this._removeListenerByIndex( event, i );
		}
	}
	return l == this._length + 1;
}

/**
	dispatches an event with any number of arguments [0;n]
	@param {String} event The name of the event to be dispatched
	@param ... Any number of parameters
	@return {String} The event name
*/
dijon.EventDispatcher.prototype.dispatchEvent = function( event ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "dispatchEvent", minArgsLength );
	var args = [];
	for( var i = 0, n = arguments.length; i < n ; i++ ){
		args.push( arguments[ i ] );
	}
			
	if( this._listeners.hasValue( event ) ){
		var toBeRemovedIndices = new Array();
		var list = this._listeners.getValue( event );
		for( var i = 0, n = list.length ; i < n ; i++ ){
			var obj = list[ i ];
			if( obj.oneShot ) {
				toBeRemovedIndices.push( i );
			}
			obj.handler.apply( obj.target, args );
		}
		
		for( var i = 0, n = toBeRemovedIndices.length ; i < n ; i++ ){
			this._removeListenerByIndex( event, toBeRemovedIndices[ i ] );
		}
	}

	return event;
}

/**
	removes all event listeners
	@return {null}
*/
dijon.EventDispatcher.prototype.removeAllEventListeners = function(){
	this._listeners = new dijon.Dictionary();
	this._length = 0;
}

/**
	Returns the number of listeners
	@return {Number} The number of listeners
*/
dijon.EventDispatcher.prototype.length = function(){
	return this._length;
}

  //======================================//
 // dijon.IInjector
//======================================//

/**
 Interface
 @class dijon.IInjector
 @author info@creynders.be
 @constructor
*/
dijon.IInjector = function(){
	this.qcn = 'dijon.IInjector';
	throw dijon.interfaceInstantiationError( this.qcn );
}

dijon.IInjector.prototype.addInjectionPoint = function( target, property, clazz, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'addInjectionPoint' );
}

dijon.IInjector.prototype.getInstance = function( clazz, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'getInstance' );	
}

dijon.IInjector.prototype.hasMapping = function( whenAskedFor, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'hasMapping' );	
}

dijon.IInjector.prototype.injectInto = function( instance ){
	throw dijon.interfaceMethodCallError( this.qcn, 'injectInto' );	
}

dijon.IInjector.prototype.instantiate = function( clazz, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'instantiate' );	
}

dijon.IInjector.prototype.mapClass = function( whenAskedFor, instantiateClass, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'mapClass' );	
}

dijon.IInjector.prototype.mapSingleton = function( whenAskedFor, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'mapSingleton' );	
}

dijon.IInjector.prototype.mapSingletonOf = function( whenAskedFor, useSingletonOf, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'mapSingletonOf' );	
}

dijon.IInjector.prototype.mapValue = function( whenAskedFor, useValue, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'mapValue' );	
}

dijon.IInjector.prototype.removeInjectionPoint = function( target, property, clazz, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'removeInjectionPoint' );	
}

dijon.IInjector.prototype.unmap = function( whenAskedFor, name ){
	throw dijon.interfaceMethodCallError( this.qcn, 'unmap' );	
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
	
	dijon.enforceInterface( this, dijon.IInjector );
	
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

/**
Create or retrieve an instance of the given class
@returns {Object} an instance of the object mapped to <code>classRef</code>
*/
dijon.Injector.prototype.getInstance = function( clazz, name ){
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "getInstance", minArgsLength );
	var value = this._mappings.getValue( clazz, name );
	var output = null;
	if( value ){
		//found
		if( value.isSingleton ){
			if( value.object == null ){
				 value.object = this._createInstance( value.clazz );
			}
			output = value.object;
		}else{
			output = this._createInstance( value.clazz );            
		}
	}else{
		throw this.name + " is missing a rule for " + clazz;        
	}
	return output;
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
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "mapClass", minArgsLength );
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
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "mapSingletonOf", minArgsLength );
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
	var minArgsLength = 1;
	if( arguments.length < minArgsLength ) throw dijon.minimumArgumentsError( this.qcn, "instantiate", minArgsLength );
	return this.getInstance( clazz, name );
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