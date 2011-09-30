/**
 * @author <a href="http://www.creynders.be">Camille Reynders</a>
 * @version 0.2.0
 * @namespace
 */
var dijon = {
	/**
	 * framework version number
	 * @constant
	 * @type String
	 */
	VERSION : '0.2.0'
};//dijon

  //======================================//
 // dijon.EventDispatcher
//======================================//

/**
 * @class dijon.EventDispatcher
 * @author Camille Reynders - www.creynders.be
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
	 * @param {String} eventType
	 * @param {Number} index
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
	 * @param {Boolean} [oneShot=false] Whether the listener must be called only once
	 * @param {Boolean} [passEvent=false] Whether the event object needs to be passed to the listener
	 * @return {dijon.EventDispatcher} The EventDispatcher instance
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
	 * @param {Boolean} [oneShot=false] Whether the listener must be called only once
	 * @param {Boolean} [passEvent=false] Whether the event object needs to be passed to the listener
	 * @return {dijon.EventDispatcher} The EventDispatcher instance
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
	 * Checks whether the dispatcher object has registered <code>listener</code> for <code>eventType</code>
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @return {Boolean}
	 */
	hasListener : function( eventType, listener ){
		return this.hasScopedListener( eventType, listener, undefined );
	},

	/**
	 * Checks whether the dispatcher object has registered <code>listener</code> in <code>scope</code> for <code>eventType</code>
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @param {Object} scope The scope in which the listener will be called
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
	 * Removes a <code>listener</code> registered for <code>eventType</code>
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @return {dijon.EventDispatcher} The EventDispatcher instance
	 */
	removeListener : function( eventType, listener ){
		this.removeScopedListener( eventType, listener, undefined );
		return this;
	},

	/**
	 * Removes a <code>listener</code> in <code>scope</code> registered for <code>eventType</code>
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Function} listener The handler to be called when the event has been dispatched
	 * @param {Object} scope The scope in which the listener will be called
	 * @return {dijon.EventDispatcher} The EventDispatcher instance
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
	 * dispatches an event with any number of arguments
	 * @param {Object|String} event The event object or event type
	 * @param {String} event.type if <code>event</code> is of type <code>Object</code> it requires a <code>type</code> property set to the name of the event that will be listened to.
	 * @param {...} [...=undefined] Any number of parameters
	 * @return {dijon.EventDispatcher} The EventDispatcher instance
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
	 * @return {dijon.EventDispatcher} The EventDispatcher instance
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
 * The Dictionary class lets you create a dynamic collection of properties, which uses strict equality (===) for key comparison.
 * @class dijon.Dictionary
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
	 * Maps <code>value</code> to <code>key</code>
	 * @param {Object} key
	 * @param {Object} value
	 * @return {dijon.Dictionary} the Dictionary instance
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
	 * removes the mapping of the value of <code>key</code>
	 * @param {Object} key
	 * @return {dijon.Dictionary} the Dictionary instance
	 */
	remove : function( key ){
		var index = this._getIndexByKey( key );
		if( index >= 0 ) return this._map.splice( index, 1 ).value;

		return this;
	},

	/**
	 * retrieves the value mapped to <code>key</code>
	 * @param {Object} key
	 * @return {Object} the value mapped to <code>key</code>
	 */
	getValue : function( key ){
		var index = this._getIndexByKey( key );

		if( index >= 0 ) return this._map[ index ].value;

		return null;
	},

	/**
	 * checks whether a value has been mapped to <code>key</code>
	 * @param {Object} key
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
 * @class dijon.Injector
 * @constructor
*/
dijon.Injector = function(){
	this.qcn = 'dijon.Injector';

	/** @private */
	this._mappingsByClassOrObject = new dijon.Dictionary();

	/** @private */
	this._injectionPoints = [];
};//dijon.Injector

dijon.Injector.prototype = {

	/**
	 * @private
	 * @param {Class} clazz
	 */
	_createAndSetupInstance : function( clazz ){
		var instance = new clazz();
		this.injectInto( instance );
		if( "setup" in instance ) instance.setup.call( instance );
		return instance;
	},

	/**
	 * @private
	 * @param {Class} clazz
	 * @param {Boolean} overrideRules
	 * @return {Object}
	 */
	_retrieveFromCacheOrCreate : function( clazz, overrideRules ){
		var value = this._mappingsByClassOrObject.getValue( clazz );
		var output = null;
		if( overrideRules ){
			output = this._createAndSetupInstance( clazz );
		}else{
			if( value ){
				if( value.isSingleton ){
					if( value.object == null  ){
						value.object = this._createAndSetupInstance( value.clazz );
					}
					output = value.object;
				}else{
					output = this._createAndSetupInstance( value.clazz );
				}
			}else{
				throw new Error( this.qcn + " is missing a rule for " + clazz );
			}
		}
		return output
	},

	/**
	 * defines <code>propertyName</code> as an injection point for <code>targetClazz</code> to be injected with an instance
	 * of <code>sourceClazz</code>.
	 * @param {Class} targetClazz the class the injection point is applied to.
	 * @param {String} propertyName the <strong>name</strong> of the property used as an injection point.<br/>
	 * [!] MUST BE STRING
	 * @param {Class} sourceClazz the type of the instance that will be injected
	 */
	addInjectionPoint : function( targetClazz, propertyName, sourceClazz ){
		this._injectionPoints.push( {
			target : targetClazz,
			property : propertyName,
			clazz : sourceClazz
		} );
	},

	/**
	 * Create (if possible) or retrieve an instance of the class mapped to <code>clazz</code>
	 * @param {Class} clazz
	 * @return {Object}
	 */
	getInstance : function( clazz ){
		return this._retrieveFromCacheOrCreate( clazz, false );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor<code> or object <code>whenAskedFor</code> inject an instance of <code>whenAskedFor<code>.
	 * @param {Class|Object} whenAskedFor
	 */
	mapSingleton : function( whenAskedFor ){
		if( this._mappingsByClassOrObject.hasValue( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this.mapSingletonOf( whenAskedFor, whenAskedFor );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or object <code>whenAskedFor</code> inject the instance <code>useValue</code>.
	 * @param {Class|Object} whenAskedFor
	 * @param {Object} useValue
	 */
	mapValue : function( whenAskedFor, useValue ){
		if( this._mappingsByClassOrObject.hasValue( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByClassOrObject.add(
			whenAskedFor,
			{
				clazz : whenAskedFor,
				object : useValue,
				isSingleton : true
			}
		);
	},

	/**
	 * Does a rule exist to satsify such a request?
	 * @param {Class} whenAskedFor
	 * @return {Boolean}
	 */
	hasMapping : function( whenAskedFor ){
		return this._mappingsByClassOrObject.hasValue( whenAskedFor );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or for object <code>whenAskedFor</code> inject a <strong>new</strong> instance of <code>instantiateClass</code>.
	 * @param {Class|Object} whenAskedFor
	 * @param {Class} instantiateClass
	 */
	mapClass : function( whenAskedFor, instantiateClass ){
		if( this.hasMapping( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByClassOrObject.add(
			whenAskedFor,
			{
				clazz : instantiateClass,
				object : null,
				isSingleton : false
			}
		);
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or object <code>whenAskedFor</code> inject an instance of <code>useSingletonOf</code>.
	 * @param {Class|Object} whenAskedFor
	 * @param {Class} useSingletonOf
	 */
	mapSingletonOf : function( whenAskedFor, useSingletonOf ){
		if( this._mappingsByClassOrObject.hasValue( whenAskedFor ) ) throw new Error( this.qcn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByClassOrObject.add(
			whenAskedFor,
			{
				clazz : useSingletonOf,
				object : null,
				isSingleton : true
			}
		);
	},

	/**
	 * create an instance of the class mapped to <code>clazz</code> and fulfill it's mapped dependencies<br/>
	 * <strong>WILL ALWAYS CREATE A NEW INSTANCE</strong>, even if <code>clazz</code> was mapped otherwise or
	 * <strong>even when <code>clazz</code> was not mapped</code>.
	 * @param {Class} clazz
	 * @return {Object}
	 */
	instantiate : function( clazz ){
		return this._retrieveFromCacheOrCreate( clazz, true );
	},

	/**
	 * Perform an injection into an object, satisfying all it's dependencies
	 * @param {Object} instance
	 */
	injectInto : function( instance ){
		for( var i = 0, n = this._injectionPoints.length ; i < n ; i++ ){
			var mapping = this._injectionPoints[ i ];
			if( instance && instance instanceof mapping.target && mapping.property in instance )
				instance[ mapping.property ] = this.getInstance( mapping.clazz );
		}
	},

	/**
	 * Remove a rule from the injector
	 * @param {Class|Object} whenAskedFor
	 */
	unmap : function( whenAskedFor ){
		this._mappingsByClassOrObject.remove( whenAskedFor );
	},

	/**
	 * removes an injection point mapping for a given class
	 * @param {Function} targetClazz
	 * @param {String} propertyName MUST BE STRING
	 * @see dijon.Injector#addInjectionPoint
	 */
	removeInjectionPoint : function( targetClazz, propertyName ){
		for( var i = 0, n = this._injectionPoints.length ; i < n ; i++ ){
			var point = this._injectionPoints[ i ];
			if( point.target == targetClazz && point.property == propertyName ) {
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
 * registers class members as listeners for specific events, before (or after) instantiation.<br/>
 * Allows for mapping listeners to lazily instantiated objects.<br/>
 * [!] This class differs substantially from the RobotLegs EventMap both in use and functionality
 * @class dijon.EventMap
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
	 * @param eventType
	 * @param clazz
	 * @param handler
	 */
	_getMappingIndex : function( mappingsListForEvent, clazz, handler ){
		if( mappingsListForEvent ){
			for( var i = 0, n = mappingsListForEvent.length; i < n ; i++ ){
				var mapping = mappingsListForEvent[ i ];
				if( mapping.clazz === clazz && mapping.handler === handler ){
					return i;
				}
			}
		}

		return -1;
	},
				
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
				var instance = this.injector.getInstance( obj.clazz );
				if( obj.oneShot )
					this.removeRuledMapping( event.type, obj.clazz, obj.handler );
				if( obj.passEvent )
					args.unshift( event );
				if( obj.handler != null )
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
	 * @param {String} eventType
	 * @param {Class} clazz
	 * @param {Function} handler
	 */
	_removeRuledMappingAndUnmapFromInjectorIfNecessary : function( eventType, clazz, handler ){
		this.removeRuledMapping( eventType, clazz, handler );
		var mappingsNum = this._mappingsNumByClazz[ clazz ] || 0;
		if( mappingsNum <= 0 )
			this.injector.unmap( clazz );
	},

	/**
	 * maps <code>handler</code> as a listener for <code>eventType</code> to be called as a member of a <code>clazz</code>
	 * instance. The instance will be created according to the rule defined for <code>clazz</code> in injector.
	 * <br/>[!] requires <code>clazz</code> is already ruled by the injector
	 * @see dijon.Injector
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Class} clazz
	 * @param {Function} handler
	 * @param {Boolean} [oneShot=false] Whether the listener must be called only once
	 * @param {Boolean} [passEvent=false] Whether the event object should be passed as a parameter to <code>handler</code>
	 * upon invocation or not. If <code>true</code> any additional dispatched values will be passed as parameters after
	 * the event object
	 */
	addRuledMapping : function( eventType, clazz, handler, oneShot, passEvent ){
		if( ! this._mappingsByEventType[ eventType ] ){
			this._mappingsByEventType[ eventType ] = [];
			this.dispatcher.addScopedListener( eventType, this._handleRuledMappedEvent, this, false, true );
		}

		var mappingsNum = this._mappingsNumByClazz[ clazz ] || 0;
		this._mappingsNumByClazz[ clazz ] = ++mappingsNum;

		this._mappingsByEventType[ eventType ].push( { clazz : clazz, handler : handler, oneShot : oneShot, passEvent: passEvent } );
		var a=1;
	},

	/**
	 * Removes the mapping for <code>clazz</code>
	 * @see dijon.EventMap#addRuledMapping
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Class} clazz
	 * @param {Function} handler
	 */
	removeRuledMapping : function( eventType, clazz, handler ){
		var mappingsListForEvent = this._mappingsByEventType[ eventType ];
		var index = this._getMappingIndex( mappingsListForEvent, clazz, handler );
		if( index >= 0 ){
			/* DO NOT CLEAN UP MAPPING DEPENDENCIES, mapping maybe still in use
			/*
			var mapping = mappingsListForEvent[ index ];
			delete mapping.clazz;
			delete mapping.handler;
			mapping = null;
			*/
			mappingsListForEvent.splice( index, 1 );
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
		return false;
	},

	/**
	 * maps <code>handler</code> as a listener for <code>eventType</code> to be called as a member of a <code>clazz</code>
	 * instance. The instance will ALWAYS be a new one, regardless of previous injector mappings for that <code>clazz</code>.<br/>
	 * If <code>handler</code> is <code>undefined</code> or <code>null</code> the instance will be created but no handler will be invoked.<br/>
	 * In that case the dispatched payload will not be passed. (no constructor injection at the moment)
	 * @param {String} eventType
	 * @param {Class} clazz
	 * @param {Function} [handler=null]
	 * @param {Boolean} [oneShot=false]
	 * @param {Boolean} [passEvent=false]
	 */
	addClassMapping : function( eventType, clazz, handler, oneShot, passEvent ){
		if( ! this.injector.hasMapping( clazz ) )
			this.injector.mapClass( clazz, clazz );
		if( handler == undefined )
			handler = null;
		this.addRuledMapping( eventType, clazz, handler, oneShot, passEvent );
	},

	/**
	 * Removes the mapping for <code>clazz</code>
	 * @see dijon.EventMap#addClassMapping
	 * @param {String} eventType
	 * @param {Class} clazz
	 * @param {Function} [handler=null]
	 */
	removeClassMapping : function( eventType, clazz, handler ){
		if( handler == undefined )
			handler = null;
		this._removeRuledMappingAndUnmapFromInjectorIfNecessary( eventType, clazz, handler );
	},

	/**
	 * Checks whether a mapping exists. The combination of <code>eventType, clazz, handler</code> must be identical
	 * to what was mapped for this to return true. If <code>clazz</code> was mapped for <code>eventType</code> <strong>with</strong>
	 * a <code>handler</code> then <code>hasMapping</code> will return <code>false</code> if only invoked with parameters
	 * <code>eventType</code> and <code>clazz</code>
	 * @param {String} eventType
	 * @param {Class} clazz
	 * @param {Function} [handler=null]
	 * @return {Boolean}
	 */
	hasMapping : function( eventType, clazz, handler ){
		if( handler == undefined )
			handler = null;
		return this._getMappingIndex( this._mappingsByEventType[ eventType ], clazz, handler ) >= 0 ;
	}


};//dijon.EventMap.prototype


  //======================================//
 // dijon.Actor
//======================================//

/**
 * Convenience class
 * @class dijon.Actor
 * @constructor
 */
dijon.Actor = function(){
	/**
	 * @type dijon.Injector
	 */
	this.injector = undefined;//inject
	
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
	/**
	 * is automatically invoked after injection has occurred.
	 * <br/> cfr. RobotLegs' <code>[PostConstruct]</code> or <code>Mediator#onRegister</code>
	 */
	setup : function(){
	}
};//dijon.Actor.prototype

  //======================================//
 // dijon.Command
//======================================//

/**
 * @class dijon.Command
 * @constructor
 * @extends dijon.Actor
 */
dijon.Command = function(){

	/**
	 * @type dijon.CommandMap
	 */
	this.commandMap = undefined;//inject

};//dijon.Command

dijon.Command.prototype = new dijon.Actor();
dijon.Command.prototype.constructor = dijon.Command;

/**
 * is automatically invoked after instantiation, injection and setup.
 * <br/>Receives the payload of the event that was dispatched or that was provided to dijon.CommandMap#execute
 * @see dijon.CommandMap#execute
 * @see dijon.EventDispatcher#dispatchEvent
 */
dijon.Command.prototype.execute = function(){

}

  //======================================//
 // dijon.CommandMap
//======================================//

/**
 * @class dijon.CommandMap
 * @constructor
 */
dijon.CommandMap = function(){

	this.qcn = 'dijon.CommandMap';
	
	/**
	 * @private
	 * @type dijon.EventMap
	 */
	this.eventMap = undefined;//inject

	/**
	 * @private
	 * @type dijon.Injector
	 */
	this.injector = undefined;
};//dijon.CommandMap

dijon.CommandMap.prototype = {
	/**
	 *
	 * @param {String} eventType
	 * @param {Class} commandClazz
	 * @param {Boolean} [oneShot] default false
	 * @param {Boolean} [passEvent] default false
	 */
	mapEvent : function( eventType, commandClazz, oneShot, passEvent ){
		this.eventMap.addClassMapping( eventType, commandClazz, commandClazz.prototype.execute, oneShot, passEvent );
	},
	
	/**
	 *
	 * @param {String} eventType
	 * @param {Class} commandClazz
	 */
	unmapEvent : function( eventType, commandClazz ){
		this.eventMap.removeClassMapping( eventType, commandClazz, commandClazz.prototype.execute );
	},

	/**
	 *
	 * @param {Class} commandClazz
	 * @param {...} [...=undefined] Any number of parameters
	 */
	execute : function( commandClazz ){
		var command = this.injector.instantiate( commandClazz );
		var args = [];

		//do not add commandClazz to args
		for( var i = 1, n = arguments.length; i < n ; i++ ){
			args.push( arguments[ i ] );
		}

		command.execute.apply( command, args );
	}
};//dijon.CommandMap.prototype



  //======================================//
 // dijon.Context
//======================================//

/**
 * @class dijon.Context
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

	/**
	 * @private
	 */
	_wireActor : function(){
		this.injector.addInjectionPoint( dijon.Actor, 'injector', dijon.Injector );
		this.injector.addInjectionPoint( dijon.Actor, 'eventDispatcher', dijon.EventDispatcher );
		this.injector.addInjectionPoint( dijon.Actor, 'eventMap', dijon.EventMap );
	},

	/**
	 * @private
	 */
	_wireCommand : function(){
		this.injector.addInjectionPoint( dijon.Command, 'commandMap', dijon.CommandMap );
		//no need to map inherited properties, since dijon has covariant injections
	},

	/**
	 * @private
	 */
	_wireAndCreateCommandMap : function(){
		this.injector.addInjectionPoint( dijon.CommandMap, 'eventMap', dijon.EventMap );
		this.injector.addInjectionPoint( dijon.CommandMap, 'injector', dijon.Injector );
		this.injector.mapSingleton( dijon.CommandMap );
		this.commandMap = this.injector.getInstance( dijon.CommandMap );
	},

	/**
	 * @param {Boolean} [autoStartup=true]
	 */
	init : function( autoStartup ){
		this._createInjector();
		this._wireAndCreateEventDispatcher();
		this._wireAndCreateEventMap();
		this._wireActor();
		this._wireCommand();
		this._wireAndCreateCommandMap();

		if( autoStartup == true || autoStartup==undefined ) this.startup();
	},

	/**
	 * abstract, should be overridden
	 */
	startup : function(){
	}
};//dijon.Context.prototype

