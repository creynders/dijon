/** @namespace */
var dijon = {
	/**
	 * framework version number
	 */
	VERSION : '0.2.0'
};//dijon

  //======================================//
 // dijon.EventDispatcher
//======================================//

/**
 * @class dijon.EventDispatcher
 * @author Camille Reynders - www.creynders.be
 * @version 1.4.0
 * @constructor
 */
dijon.EventDispatcher = function(){

	this.qcn = 'dijon.EventDispatcher';

	/** @private */
	this._listeners = {};

	/** @private */
	this._length = 0;

};//dijon.EventDispatcher

dijon.EventDispatcher.prototype = {

	/**
	 * @private
	 * @param eventType
	 * @param index
	 */
	_removeListenerByIndex : function( eventType, index ){
		this._listeners[ eventType ].splice( index, 1 );
		if( this._listeners[ eventType ].length <= 0 )
			delete this._listeners[ eventType ];
		this._length--;
	},

	/**
	 * adds a handler to be invoked when an event is dispatched
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @param {Boolean} [oneShot] Whether the listener must be called only once, default <code>false</code>
	 * @param {Boolean} [passEvent] Whether the event object needs to be passed to the listener, default <code>false</code>
	 * @return {EventDispatcher} The EventDispatcher instance
	*/
	addListener : function( eventType, listener, oneShot, passEvent ) {
		this.addScopedListener( eventType, listener, undefined, oneShot, passEvent );
		return this;
	},

	/**
	 * adds a handler to be invoked in a specific <code>scope</code> when an event of <code>eventType</code> is dispatched
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @param {Object} scope The scope in which the listener will be called
	 * @param {Boolean} [oneShot] Whether the listener must be called only once, default <code>false</code>
	 * @param {Boolean} [passEvent] Whether the event object needs to be passed to the listener, default <code>false</code>
	 * @return {EventDispatcher} The EventDispatcher instance
	 */
	addScopedListener : function( eventType, listener, scope, oneShot, passEvent ){
		if( oneShot == undefined ) oneShot = false;
		if( passEvent == undefined ) passEvent = false;
		if( this._listeners[ eventType ] == undefined ){
			this._listeners[ eventType ] = [];
		}
		this._listeners[ eventType ].push( {
			scope : scope,
			listener : listener,
			oneShot : oneShot,
			passEvent : passEvent
		} );
		++this._length;
		return this;
	},

	/**
	 *
	 * @param eventType
	 * @param listener
	 * @return {Boolean}
	 */
	hasListener : function( eventType, listener ){
		return this.hasScopedListener( eventType, listener, undefined );
	},

	/**
	 *
	 * @param eventType
	 * @param listener
	 * @param scope
	 * @return {Boolean}
	 */
	hasScopedListener : function( eventType, listener, scope ){
		if( this._listeners[ eventType ] ){
			var listeners = this._listeners[ eventType ];
			for( var i = 0, n = listeners.length ; i < n ; i++  ){
				var obj = listeners[ i ];
				if( obj.listener === listener && obj.scope === scope ){
					return true;
				}
			}
		}

		return false;
	},

	/**
	 *
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @return {EventDispatcher} The EventDispatcher instance
	 */
	removeListener : function( eventType, listener ){
		this.removeScopedListener( eventType, listener, undefined );
		return this;
	},

	/**
	 *
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @param {Object} scope The scope in which the listener will be called
	 * @return {EventDispatcher} The EventDispatcher instance
	 */
	removeScopedListener : function( eventType, listener, scope ) {
		for ( var i = 0 ; this._listeners[ eventType ] && i < this._listeners[ eventType ].length ;  ){
			var obj = this._listeners[ eventType ][ i ];
			if( obj.listener == listener && obj.scope === scope ){
				this._removeListenerByIndex( eventType, i );
			}else{
				i++;
			}
		}
		return this;
	},

	/**
	 * dispatches an event with any number of arguments [0;n]
	 * @param {Object} event The event object or event type
	 * @param ... Any number of parameter
	 * @return {EventDispatcher} The EventDispatcher instance
	 */
	dispatchEvent : function( event ){
		if (typeof event == "string"){
			event = { type: event };
		}
		if (!event.target){
			event.target = this;
		}
		var args = [];
		for( var i = 1, n = arguments.length; i < n ; i++ ){
			args.push( arguments[ i ] );
		}

		if( this._listeners[ event.type ] ){
			for( var i = 0 ; this._listeners[ event.type ] && i < this._listeners[ event.type ].length ;  ){
				var obj = this._listeners[ event.type ][ i ];
				if( obj.oneShot ){
					this._removeListenerByIndex( event.type, i );
				}else{
					i++;
				}
				if( obj.passEvent ){
					args.unshift( event );
				}
				obj.listener.apply( obj.scope, args );
			}
		}

		return this;
	},

	/**
	 * removes all event listeners
	 * @return {EventDispatcher} The EventDispatcher instance
	 */
	removeAllListeners : function(){
	   this._listeners = {};
	   this._length = 0;

	   return this;
	},

	/**
	 * Returns the number of listeners
	 * @return {Number} The number of listeners
	 */
	length : function(){
		return this._length;
	}

};//dijon.EventDispatcher.prototype

  //======================================//
 // dijon.Dictionary
//======================================//

/**
 * @class dijon.Dictionary
 * @author Camille Reynders - www.creynders.be
 * @constructor
 */
dijon.Dictionary = function(){

	this.qcn = 'dijon.Dictionary';
	
	/**
	 * @private
	 */
	this._map = [];
	
};//dijon.Dictionary

dijon.Dictionary.prototype = {
	/**
	 * @private
	 * @param key
	 * @return index
	 */
	_getIndexByKey : function( key ){
		for( var i = 0, n = this._map.length ; i < n ; i++ ){
			if( this._map[ i ].key === key ) return i;
		}

		return -1;
	},

	/**
	 * @param {Object} key
	 * @param {Object} value
	 * @return {Dictionary} the Dictionary instance
	 */
	add : function( key, value ){
		var index = this._getIndexByKey( key );
		if( index < 0 ){
			this._map.push( {
				key : key,
				value : value
			});
		}else{
			this._map[ index ] = {
				key : key,
				value : value
			}
		}
		return this;
	},

	/**
	 * @param {Object} key
	 * @return {Dictionary} the Dictionary instance
	 */
	remove : function( key ){
		var index = this._getIndexByKey( key );
		if( index >= 0 ) return this._map.splice( index, 1 ).value;

		return this;
	},

	/**
	 * @param {Object} key
	 * @return {Object}
	 */
	getValue : function( key ){
		var index = this._getIndexByKey( key );

		if( index >= 0 ) return this._map[ index ].value;

		return null;
	},

	/**
	 *
	 * @param key
	 * @return {Boolean}
	 */
	hasValue : function( key ){
		var index = this._getIndexByKey( key );
		return ( index >= 0 );
	}

};//dijon.Dictionary.prototype

  //======================================//
 // dijon.Injector
//======================================//

/**
 @class dijon.Injector
 @author Camille Reynders - www.creynders.be
 @constructor
*/
dijon.Injector = function(){
	this.qcn = 'dijon.Injector';

	/** @private */
	this._mappingsByEventType = new dijon.Dictionary();

	/** @private */
	this._injectionPoints = [];
};//dijon.Injector

dijon.Injector.prototype = {

	/**
	 * @private
	 * @param clazz
	 */
	_createAndSetupInstance : function( clazz ){
		var instance = new clazz();
		this.injectInto( instance );
		if( "setup" in instance ) instance.setup.call( instance );
		return instance;
	},

	/**
	 * @private
	 * @param clazz
	 * @param overrideSingleton
	 */
	_retrieveFromCacheOrCreate : function( clazz, overrideSingleton ){
		var value = this._mappingsByEventType.getValue( clazz );
		var output = null;
		if( value ){
			//found
			if( value.isSingleton && ! overrideSingleton ){
				if( value.object == null ){
					 value.object = this._createAndSetupInstance( value.clazz );
				}
				output = value.object;
			}else{
				output = this._createAndSetupInstance( value.clazz );
			}
		}else{
			throw new Error( this.qcn + " is missing a rule for " + clazz );
		}
		return output;
	},

	/**
	 *
	 * @param {Function} targetClazz
	 * @param {String} propertyName
	 * @param {Function} sourceClazz
	 */
	addInjectionPoint : function( targetClazz, propertyName, sourceClazz ){
		this._injectionPoints.push( {
			target : targetClazz,
			property : propertyName,
			clazz : sourceClazz
		} );
	},

	/**
	 *
	 * @param clazz
	 */
	getInstance : function( clazz ){
		return this._retrieveFromCacheOrCreate( clazz, false );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor<code> inject an instance of <code>whenAskedFor<code>.
	 * @param {Function} whenAskedFor
	 */
	mapSingleton : function( whenAskedFor ){
		if( this._mappingsByEventType.hasValue( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this.mapSingletonOf( whenAskedFor, whenAskedFor );
	},

	/**
	 *
	 * @param whenAskedFor
	 * @param useValue
	 */
	mapValue : function( whenAskedFor, useValue ){
		if( this._mappingsByEventType.hasValue( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByEventType.add(
			whenAskedFor,
			{
				clazz : whenAskedFor,
				object : useValue,
				isSingleton : true
			}
		);
	},

	/**
	 *
	 * @param whenAskedFor
	 */
	hasMapping : function( whenAskedFor ){
		return this._mappingsByEventType.hasValue( whenAskedFor );
	},

	/**
	 *
	 * @param whenAskedFor
	 * @param instantiateClass
	 */
	mapClass : function( whenAskedFor, instantiateClass ){
		if( this.hasMapping( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByEventType.add(
			whenAskedFor,
			{
				clazz : instantiateClass,
				object : null,
				isSingleton : false
			}
		);
	},

	/**
	 *
	 * @param whenAskedFor
	 * @param useSingletonOf
	 */
	mapSingletonOf : function( whenAskedFor, useSingletonOf ){
		if( this._mappingsByEventType.hasValue( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByEventType.add(
			whenAskedFor,
			{
				clazz : useSingletonOf,
				object : null,
				isSingleton : true
			}
		);
	},

	/**
	 *
	 * @param clazz
	 */
	instantiate : function( clazz ){
		return this._retrieveFromCacheOrCreate( clazz, true );
	},

	/**
	 *
	 * @param instance
	 */
	injectInto : function( instance ){
		for( var i = 0, n = this._injectionPoints.length ; i < n ; i++ ){
			var mapping = this._injectionPoints[ i ];
			if( instance && instance instanceof mapping.target && mapping.property in instance )
				instance[ mapping.property ] = this.getInstance( mapping.clazz );
		}
	},

	/**
	 *
	 * @param whenAskedFor
	 */
	unmap : function( whenAskedFor ){
		this._mappingsByEventType.remove( whenAskedFor );
	},

	/**
	 *
	 * @param target
	 * @param property
	 */
	removeInjectionPoint : function( target, property ){
		for( var i = 0, n = this._injectionPoints.length ; i < n ; i++ ){
			var point = this._injectionPoints[ i ];
			if( point.target == target && point.property == property ) {
				this._injectionPoints.splice( i, 1 );
				return;
			}
		}
	}

};//dijon.Injector.prototype

  //======================================//
 // dijon.EventMap
//======================================//

/**
 * Facade for event mapping types
 * @class dijon.EventMap
 * @author Camille Reynders - www.creynders.be
 * @constructor
 */
dijon.EventMap = function(){
	this.qcn = 'dijon.EventMap';

	/**
	 * @private
	 * @type Object
	 */
	this._mappingsByEventType = {};

	/**
	 * @private
	 * @type Object
	 */
	this._mappingsNumByClazz = {};

	/**
	 * @private
	 * @type dijon.EventDispatcher
	 */
	this.dispatcher = undefined; //inject

	/**
	 * @private
	 * @type dijon.Injector
	 */
	this.injector = undefined; //inject

};//dijon.EventMap

dijon.EventMap.prototype = {
	/**
	 * @private
	 * @param {Object} event
	 */
	_handleRuledMappedEvent : function( event ){
		var mappingsListForEvent = this._mappingsByEventType[ event.type ];
		var args = [];

		for( var i = 1, n = arguments.length; i < n ; i++ ){
			args.push( arguments[ i ] );
		}
		for( var i = 0, n = mappingsListForEvent.length; i < n; i++ ){
			var obj = mappingsListForEvent[i];
			if( this.injector.hasMapping( obj.clazz ) ){
				if( obj.oneShot )
					this.removeRuledMapping( event.type, obj.clazz, obj.handler );
				var instance = this.injector.getInstance( obj.clazz );
				if( obj.passEvent )
					args.unshift( event );
				obj.handler.apply( instance, args );
			}else{
				//injector mapping has been deleted, but
				//eventMap mapping not
				//TODO: remove or throw error?
			}
		}
	},

	/**
	 * @private
	 * @param eventType
	 * @param clazz
	 * @param handler
	 */
	_removeRuledMappingAndUnmapFromInjectorIfNecessary : function( eventType, clazz, handler ){
		this.removeRuledMapping( eventType, clazz, handler );
		var mappingsNum = this._mappingsNumByClazz[ clazz ] || 0;
		if( mappingsNum <= 0 )
			this.injector.unmap( clazz );
	},

	/**
	 * @param eventType
	 * @param clazz
	 * @param handler
	 * @param oneShot
	 * @param {Boolean} [passEvent] default false
	 */
	addRuledMapping : function( eventType, clazz, handler, oneShot, passEvent ){
		if( ! this._mappingsByEventType[ eventType ] ){
			this._mappingsByEventType[ eventType ] = [];
			this.dispatcher.addScopedListener( eventType, this._handleRuledMappedEvent, this, false, true );
		}

		var mappingsNum = this._mappingsNumByClazz[ clazz ] || 0;
		this._mappingsNumByClazz[ clazz ] = ++mappingsNum;

		this._mappingsByEventType[ eventType ].push( { clazz : clazz, handler : handler, oneShot : oneShot, passEvent: passEvent } );
	},

	/**
	 *
	 * @param eventType
	 * @param clazz
	 * @param handler
	 */
	removeRuledMapping : function( eventType, clazz, handler ){
		var mappingsListForEvent = this._mappingsByEventType[ eventType ];
		if( mappingsListForEvent ){
			for( var i = 0, n = mappingsListForEvent.length; i < n ; i++ ){
				var mapping = mappingsListForEvent[ i ];
				if( mapping.clazz === clazz && mapping.handler === handler ){
					delete mapping.clazz;
					delete mapping.handler;
					mapping = null;
					mappingsListForEvent.splice( i, 1 );
					if( mappingsListForEvent.length <= 0 )
						delete mappingsListForEvent[ eventType ];
					var mappingsNum = this._mappingsNumByClazz[ clazz ] || 0;
					if( mappingsNum <= 0 ){
						delete this._mappingsNumByClazz[ clazz ];
					}else{
						this._mappingsNumByClazz[ clazz ] = --mappingsNum;
					}
					return true;
				}
			}
		}

		return false;
	},

	/**
	 *
	 * @param eventType
	 * @param clazz
	 * @param handler
	 * @param {Boolean} [oneShot] default false
	 * @param {Boolean} [passEvent] default false
	 */
	addClassMapping : function( eventType, clazz, handler, oneShot, passEvent ){
		if( ! this.injector.hasMapping( clazz ) ){
			this.injector.mapClass( clazz, clazz );
		}

		this.addRuledMapping( eventType, clazz, handler, oneShot, passEvent );
	},

	removeClassMapping : function( eventType, clazz, handler ){
		this._removeRuledMappingAndUnmapFromInjectorIfNecessary( eventType, clazz, handler );
	}

};//dijon.EventMap.prototype


  //======================================//
 // dijon.Actor
//======================================//

/**
 * @class dijon.Actor
 * @author Camille Reynders - www.creynders.be
 * @constructor
 */
dijon.Actor = function(){
	/**
	 * @type dijon.EventMap
	 */
	this.eventMap = undefined;//inject

	/**
	 * @type dijon.EventDispatcher
	 */
	this.eventDispatcher = undefined; //inject
};//dijon.Actor

dijon.Actor.prototype = {
	setup : function(){
	}
};//dijon.Actor.prototype

  //======================================//
 // dijon.Command
//======================================//

/**
 * @class dijon.Command
 * @author Camille Reynders - www.creynders.be
 * @constructor
 */
dijon.Command = function(){
	/**
	 * @type dijon.Injector
	 */
	this.injector = undefined;//inject

};//dijon.Command

dijon.Command.prototype = new dijon.Actor();
dijon.Command.prototype.constructor = dijon.Command;

dijon.Command.prototype.execute = function(){

}

  //======================================//
 // dijon.CommandMap
//======================================//

/**
 * @class dijon.CommandMap
 * @author Camille Reynders - www.creynders.be
 * @constructor
 */
dijon.CommandMap = function(){
	/**
	 * @private
	 * @type dijon.EventMap
	 */
	this.eventMap = undefined;//inject
};//dijon.CommandMap

dijon.CommandMap.prototype = {
	/**
	 *
	 * @param eventType
	 * @param commandClazz
	 * @param {Boolean} [oneShot] default false
	 * @param {passEvent} [oneShot] default false
	 */
	mapEvent : function( eventType, commandClazz, oneShot, passEvent ){
		this.eventMap.addClassMapping( eventType, commandClazz, commandClazz.prototype.execute, oneShot, passEvent );
	},
	unmapEvent : function( eventType, commandClazz ){
		this.eventMap.removeClassMapping( eventType, commandClazz, commandClazz.prototype.execute );
	}
};//dijon.CommandMap.prototype



  //======================================//
 // dijon.Context
//======================================//

/**
 * @class dijon.Context
 * @author Camille Reynders - www.creynders.be
 * @constructor
 */
dijon.Context = function(){
	this.qcn = 'dijon.Context';

	/**
	 * @type dijon.Injector
	 */
	this.injector = undefined;

	/**
	 * @type dijon.EventMap
	 */
	this.eventMap = undefined;

	/**
	 * @type dijon.EventDispatcher
	 */
	this.eventDispatcher = undefined;

	/**
	 * @type dijon.CommandMap
	 */
	this.commandMap = undefined;

	this._createInjector();
	this._wireAndCreateEventDispatcher();
	this._wireAndCreateEventMap();
	this._wireActor();
	this._wireCommand();
	this._wireAndCreateCommandMap();

};//dijon.Context

dijon.Context.prototype = {

	/**
	 * @private
	 */
	_createInjector : function(){
		this.injector = new dijon.Injector();
		this.injector.mapValue( dijon.Injector, this.injector );
	},
	/**
	 * @private
	 */
	_wireAndCreateEventDispatcher : function(){
		this.injector.mapSingleton( dijon.EventDispatcher );
		this.eventDispatcher = this.injector.getInstance( dijon.EventDispatcher );
	},
	/**
	 * @private
	 */
	_wireAndCreateEventMap : function(){
		this.injector.addInjectionPoint( dijon.EventMap, 'dispatcher', dijon.EventDispatcher );
		this.injector.addInjectionPoint( dijon.EventMap, 'injector', dijon.Injector );
		this.injector.mapSingleton( dijon.EventMap );
		this.eventMap = this.injector.getInstance( dijon.EventMap );
	},

	_wireActor : function(){
		this.injector.addInjectionPoint( dijon.Actor, 'eventDispatcher', dijon.EventDispatcher );
		this.injector.addInjectionPoint( dijon.Actor, 'eventMap', dijon.EventMap );
	},

	_wireCommand : function(){
		this.injector.addInjectionPoint( dijon.Command, 'injector', dijon.Injector );
		//no need to map inherited properties, since dijon has covariant injections
	},

	_wireAndCreateCommandMap : function(){
		this.injector.addInjectionPoint( dijon.CommandMap, 'eventMap', dijon.EventMap );
		this.injector.mapSingleton( dijon.CommandMap );
		this.commandMap = this.injector.getInstance( dijon.CommandMap );
	}
};//dijon.Context.prototype

