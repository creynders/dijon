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
	VERSION : '0.4.1'
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

	this.fqn = 'dijon.EventDispatcher';

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
        var argsWithEvent = [ event ].concat( args );

		if( this._listeners[ event.type ] ){
			for( var i = 0 ; this._listeners[ event.type ] && i < this._listeners[ event.type ].length ;  ){
				var obj = this._listeners[ event.type ][ i ];
				if( obj.oneShot ){
					this._removeListenerByIndex( event.type, i );
				}else{
					i++;
				}
                var payload = ( obj.passEvent ) ? argsWithEvent : args;
				obj.listener.apply( obj.scope, payload );

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

	this.fqn = 'dijon.Dictionary';
	
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
			if( this._map[ i ].key === key )
                return i;
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
	this.fqn = 'dijon.Injector';

	/** @private */
	this._mappingsByClassOrObject = new dijon.Dictionary();

	/** @private */
	this._outlets = [];
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
	 * @param {Class} key
	 * @param {Boolean} overrideRules
	 * @return {Object}
	 */
	_retrieveFromCacheOrCreate : function( key, overrideRules ){
		var config = this._mappingsByClassOrObject.getValue( key );
		var output = null;
		if( overrideRules ){
            //key is a class
            //TODO: check if it IS a class
			output = this._createAndSetupInstance( key );
		}else{
			if( config ){
				if( config.isSingleton ){
					if( config.object == null  ){
						config.object = this._createAndSetupInstance( config.clazz );
					}
					output = config.object;
				}else{
					output = this._createAndSetupInstance( config.clazz );
				}
			}else{
				throw new Error( this.fqn + " is missing a rule for " + key );
			}
		}
		return output
	},


	/**
	 * defines <code>propertyName</code> as an injection point for the class mapped to <code>targetKey</code> to be injected with an instance
	 * of the class mapped to <code>sourceKey</code>.
	 * @param {Class} targetKey the class the injection point is applied to.
	 * @param {String} propertyName the <strong>name</strong> of the property used as an injection point.<br/>
	 * [!] MUST BE STRING
	 * @param {Object} sourceKey the key to the value that will be injected
     * @see dijon.Injector#removeOutlet
	 */
	addOutlet : function( targetKey, propertyName, sourceKey ){
		this._outlets.push( {
			target : targetKey,
			property : propertyName,
			source : sourceKey
		} );
	},

	/**
	 * Create (if possible) or retrieve an instance of the class mapped to <code>key</code>
	 * @param {Object} key
	 * @return {Object}
	 */
	getInstance : function( key ){
		return this._retrieveFromCacheOrCreate( key, false );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor<code> or object <code>whenAskedFor</code> inject an instance of <code>whenAskedFor<code>.
	 * @param {Class|Object} whenAskedFor
	 */
	mapSingleton : function( whenAskedFor ){
		if( this._mappingsByClassOrObject.hasValue( whenAskedFor ) ) throw new Error( this.fqn + ' cannot remap ' + whenAskedFor + ' without unmapping first' );
		this.mapSingletonOf( whenAskedFor, whenAskedFor );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or object <code>whenAskedFor</code> inject the instance <code>useValue</code>.
	 * @param {Class|Object} whenAskedFor
	 * @param {Object} useValue
	 */
	mapValue : function( whenAskedFor, useValue ){
		if( whenAskedFor == null || whenAskedFor == undefined ) throw new Error( this.fqn + ' cannot map to an undefined object' );
		if( useValue == null || useValue == undefined ) throw new Error( this.fqn + ' cannot map an undefined object' );
		if( this._mappingsByClassOrObject.hasValue( whenAskedFor ) ) throw new Error( this.fqn + ' cannot remap ' + ' without unmapping first' );
		this._mappingsByClassOrObject.add(
			whenAskedFor,
			{
				clazz : whenAskedFor,
				object : useValue,
				isSingleton : true
			}
		);
	},

	setValue : function( whenAskedFor, useValue ){
		var config = this._mappingsByClassOrObject.getValue( whenAskedFor );
		config.object = useValue;
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
		if( this.hasMapping( whenAskedFor ) ) throw new Error( this.fqn + ' cannot remap ' + ' without unmapping first' );
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
		if( this._mappingsByClassOrObject.hasValue( whenAskedFor ) ) throw new Error( this.fqn + ' cannot remap ' + ' without unmapping first' );
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
	 * create an instance of the class mapped to <code>keyOrClass</code> and fulfill it's mapped dependencies<br/>
	 * <strong>WILL ALWAYS CREATE A NEW INSTANCE</strong>, even if <code>keyOrClass</code> was mapped otherwise or
	 * <strong>even when <code>keyOrClass</code> was not mapped</code>.
	 * @param {Class} keyOrClass
	 * @return {Object}
	 */
	instantiate : function( keyOrClass ){
		return this._retrieveFromCacheOrCreate( keyOrClass, true );
	},

	/**
	 * Perform an injection into an object, satisfying all it's dependencies
	 * @param {Object} instance
	 */
	injectInto : function( instance ){
		for( var i = 0, n = this._outlets.length ; i < n ; i++ ){
			var mapping = this._outlets[ i ];
			if( instance && instance instanceof mapping.target && mapping.property in instance )
				instance[ mapping.property ] = this.getInstance( mapping.source );
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
	 * removes an injection point mapping for a given class mapped to <code>key</code>
	 * @param {Object} key
	 * @param {String} propertyName MUST BE STRING
	 * @see dijon.Injector#addOutlet
	 */
	removeOutlet : function( key, propertyName ){
		for( var i = 0, n = this._outlets.length ; i < n ; i++ ){
			var point = this._outlets[ i ];
			if( point.target == key && point.property == propertyName ) {
				this._outlets.splice( i, 1 );
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
	this.fqn = 'dijon.EventMap';

	/**
	 * @private
	 * @type Object
	 */
	this._mappingsByEventType = {};

	/**
	 * @private
	 * @type Object
	 */
	this._mappingsNumByKey = {};

	/**
	 * @private
	 * @type dijon.EventDispatcher
	 */
	this.eventDispatcher = undefined; //inject

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
	 * @param key
	 * @param handler
	 */
	_getMappingIndex : function( mappingsListForEvent, key, handler ){
		if( mappingsListForEvent ){
			for( var i = 0, n = mappingsListForEvent.length; i < n ; i++ ){
				var mapping = mappingsListForEvent[ i ];
				if( mapping.key === key && mapping.handler === handler ){
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

        var argsWithEvent = [ event ].concat( args );
        var toBeRemoved = [];
        var i, n, obj;
		for( i = 0, n = mappingsListForEvent.length; i < n; i++ ){
			obj = mappingsListForEvent[i];
			if( this.injector.hasMapping( obj.key ) ){
				var instance = this.injector.getInstance( obj.key );
				if( obj.oneShot )
                    toBeRemoved.push( obj );
				if( obj.handler != null )
                    var payload = ( obj.passEvent ) ? argsWithEvent : args;
					instance[ obj.handler ].apply( instance, payload );
					//obj.handler.apply( instance, args );
			}else{
				//injector mapping has been deleted, but
				//eventMap mapping not
				//TODO: remove or throw error?
			}
		}

        for( i = 0, n = toBeRemoved.length; i < n; i++ ){
            var obj = toBeRemoved[ i ];
            this.removeRuledMapping( event.type, obj.key, obj.handler );
        }
	},

	/**
	 * @private
	 * @param {String} eventType
	 * @param {Class} key
	 * @param {Function} handler
	 */
	_removeRuledMappingAndUnmapFromInjectorIfNecessary : function( eventType, key, handler ){
		this.removeRuledMapping( eventType, key, handler );
		var mappingsNum = this._mappingsNumByKey[ key ] || 0;
		if( mappingsNum <= 0 )
			this.injector.unmap( key );
	},

	/**
	 * maps <code>handler</code> as a listener for <code>eventType</code> to be called as an instance member of the class mapped to <code>key</code>
	 * instance. The instance will be created according to the rule defined for <code>key</code> in injector.
	 * <br/>[!] requires <code>key</code> is already ruled by the injector
	 * @see dijon.Injector
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Object} key
	 * @param {Function} handler
	 * @param {Boolean} [oneShot=false] Whether the listener must be called only once
	 * @param {Boolean} [passEvent=false] Whether the event object should be passed as a parameter to <code>handler</code>
	 * upon invocation or not. If <code>true</code> any additional dispatched values will be passed as parameters after
	 * the event object
	 */
	addRuledMapping : function( eventType, key, handler, oneShot, passEvent ){
		if( ! this.injector.hasMapping( key ) ){
			throw new Error( '*** ERROR *** ' + this.fqn + ' addRuledMapping can only be used on a key already mapped by the injector')
		}
		if( ! this._mappingsByEventType[ eventType ] ){
			this._mappingsByEventType[ eventType ] = [];
			this.eventDispatcher.addScopedListener( eventType, this._handleRuledMappedEvent, this, false, true );
		}

		var mappingsNum = this._mappingsNumByKey[ key ] || 0;
		this._mappingsNumByKey[ key ] = ++mappingsNum;

		this._mappingsByEventType[ eventType ].push( { key : key, handler : handler, oneShot : oneShot, passEvent: passEvent } );
	},

	/**
	 * Removes the mapping for <code>key</code>
	 * @see dijon.EventMap#addRuledMapping
	 * @param {String} eventType The name of the event to be listened to
	 * @param {Class} key
	 * @param {Function} handler
	 */
	removeRuledMapping : function( eventType, key, handler ){
		var mappingsListForEvent = this._mappingsByEventType[ eventType ];
		var index = this._getMappingIndex( mappingsListForEvent, key, handler );
		if( index >= 0 ){
			/* DO NOT CLEAN UP MAPPING DEPENDENCIES, mapping maybe still in use */
			/*
			var mapping = mappingsListForEvent[ index ];
			delete mapping.key;
			delete mapping.handler;
			mapping = null;
			*/
			mappingsListForEvent.splice( index, 1 );
			if( mappingsListForEvent.length <= 0 )
				delete mappingsListForEvent[ eventType ];
			var mappingsNum = this._mappingsNumByKey[ key ] || 0;
			if( mappingsNum <= 0 ){
				delete this._mappingsNumByKey[ key ];
			}else{
				this._mappingsNumByKey[ key ] = --mappingsNum;
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
	 * Checks whether a mapping exists. The combination of <code>eventType, key, handler</code> must be identical
	 * to what was mapped for this to return true. If <code>key</code> was mapped for <code>eventType</code> <strong>with</strong>
	 * a <code>handler</code> then <code>hasMapping</code> will return <code>false</code> if only invoked with parameters
	 * <code>eventType</code> and <code>key</code>
	 * @param {String} eventType
	 * @param {Object} key
	 * @param {Function} [handler=null]
	 * @return {Boolean}
	 */
	hasMapping : function( eventType, key, handler ){
		if( handler == undefined )
			handler = null;
		return this._getMappingIndex( this._mappingsByEventType[ eventType ], key, handler ) >= 0 ;
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
 // dijon.Context
//======================================//

/**
 * @class dijon.Context
 * @constructor
 */
dijon.Context = function(){
	this.fqn = 'dijon.Context';

};//dijon.Context
dijon.Context.prototype = new dijon.Actor();
dijon.Context.prototype.constructor = dijon.Context;

/**
 * @private
 */
dijon.Context.prototype._createInjector = function(){
	this.injector = new dijon.Injector();
};

/**
 * @private
 */
dijon.Context.prototype._setupWirings = function(){
	this.parseConfig( dijon.wirings );
	this.injector.setValue( dijon.wirings.injector, this.injector );
}
/**
 * @param {Boolean} [autoStartup=true]
 */
dijon.Context.prototype.init = function( autoStartup ){
	this._createInjector();
	this._setupWirings();
	this.injector.injectInto( this );
	if( autoStartup == true || autoStartup==undefined ) this.startup();
};

dijon.Context.prototype.parseConfig = function( configList ){
	for( var configName in configList ){
		var configObj = configList[ configName ];
		if( configObj.singleton ){
			this.injector.mapSingletonOf( configObj, configObj.impl );
		}else{
			this.injector.mapClass( configObj, configObj.impl );
		}
		for( var outletName in configObj.outlets ){
			var outletWiring = configObj.outlets[ outletName ];
			this.injector.addOutlet( configObj.impl, outletName, outletWiring );
		}
		for( var i in configObj.handlers ){
			var handlerConfig = configObj.handlers[ i ];
			this.eventMap.addRuledMapping( handlerConfig.event, configObj, handlerConfig.handler, handlerConfig.oneShot, handlerConfig.passEvent )
		}
	}
};



/**
 * abstract, should be overridden
 */
dijon.Context.prototype.startup = function(){
}

dijon.wirings = {};
dijon.wirings.injector = {
	impl : dijon.Injector,
	singleton : true
};
dijon.wirings.eventDispatcher = {
	impl : dijon.EventDispatcher,
	singleton : true
};
dijon.wirings.eventMap = {
	impl : dijon.EventMap,
	singleton : true,
	outlets : {
		eventDispatcher : dijon.wirings.eventDispatcher,
		injector : dijon.wirings.injector
	}
};
dijon.wirings.actor = {
	impl : dijon.Actor,
	singleton : true,
	outlets : {
		eventDispatcher : dijon.wirings.eventDispatcher,
		injector : dijon.wirings.injector,
		eventMap : dijon.wirings.eventMap
	}
};
