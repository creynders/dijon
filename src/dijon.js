/*
	Dijon Framework
	@author Camille Reynders - www.creynders.be
	@version 0.2.0
 */

(function(global){

	/** @namespace */
	var dijon = {
		/**
		 * framework version number
		 */
		VERSION : '0.2.0'
	}//dijon

	  //======================================//
	 // dijon.EventDispatcher
	//======================================//

	/**
	 * @class EventDispatcher
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

	}//dijon.EventDispatcher
	
	dijon.EventDispatcher.prototype = {

		/**
		 * @private
		 * @param eventType
		 * @param index
		 */
		_removeListenerByIndex : function( eventType, index ){
			this._listeners[ eventType ].splice( index, 1 );
			this._length--;
		},

		/**
		 * adds a handler to be invoked when an event is dispatched
		 * @param {String} eventType The name of the event to be listened to
		 * @param {Function} listener The handler to be called when the event has been dispatched
		 * @param {Boolean} [oneShot] Whether the listener must be called only once, default <code>false</code>
		 * @return {EventDispatcher} The EventDispatcher instance
		*/
		addListener : function( eventType, listener, oneShot ) {
			this.addScopedListener( eventType, listener, undefined, oneShot );
			return this;
		},

		/**
		 * adds a handler to be invoked in a specific <code>scope</code> when an event of <code>eventType</code> is dispatched
		 * @param {String} eventType The name of the event to be listened to
		 * @param {Function} listener The handler to be called when the event has been dispatched
		 * @param {Object} scope The scope in which the listener will be called
		 * @param {Boolean} [oneShot] Whether the listener must be called only once, default <code>false</code>
		 * @return {EventDispatcher} The EventDispatcher instance
		 */
		addScopedListener : function( eventType, listener, scope, oneShot ){
			if( oneShot == undefined ) oneShot = false;
			if( ! this._listeners[ eventType ] ){
				this._listeners[ eventType ] = new Array();
			}
			this._listeners[ eventType ].push( {
				scope : scope,
				listener : listener,
				oneShot : oneShot
			} );
			++this._length;
			return this;
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
			for ( var i = 0 ; i < this._listeners[ eventType ].length ;  ){
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
				for( var i = 0 ; i < this._listeners[ event.type ].length ;  ){
					var obj = this._listeners[ event.type ][ i ];
					if( obj.oneShot ){
						this._removeListenerByIndex( event.type, i );
					}else{
						i++;
					}
					obj.listener.call( obj.scope, event, args );
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

	}//dijon.EventDispatcher.prototype

	  //======================================//
	 // dijon.Dictionary
	//======================================//

	/**
	 @class dijon.Dictionary
	 @author Camille Reynders - www.creynders.be
	 @constructor
	 */
	dijon.Dictionary = function(){
		this.qcn = 'dijon.Dictionary';
		/**
		 * @private
		 */
		this._map = [];
	}//dijon.Dictionary

	dijon.Dictionary.prototype = {
		/**
		 * @private
		 * @param key
		 * @param name
		 * @return index
		 */
		_getIndexByKey : function( key, name ){
			for( var i = 0, n = this._map.length ; i < n ; i++ ){
				if( this._map[ i ].key === key && this._map[ i ].name == name ) return i;
			}

			return -1;
		},

		/**
		 * @param {Object} key
		 * @param {Object} value
		 * @param {String} [name]
		 * @return {Dictionary} the Dictionary instance
		 */
		add : function( key, value, name ){
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
			return this;
		},

		/**
		 * @param {Object} key
		 * @param {String} [name]
		 * @return {Dictionary} the Dictionary instance
		 */
		remove : function( key, name ){
			var index = this._getIndexByKey( key, name );
			if( index >= 0 ) return this._map.splice( index, 1 ).value;

			return this;
		},

		/**
		 * @param {Object} key
		 * @param {String} [name]
		 * @return {Object} 
		 */
		getValue : function( key, name ){
			var index = this._getIndexByKey( key, name );

			if( index >= 0 ) return this._map[ index ].value;

			return null;
		},

		/**
		 * 
		 * @param key
		 * @param [name]
		 * @return {Boolean}
		 */
		hasValue : function( key, name ){
			var index = this._getIndexByKey( key, name );
			return ( index >= 0 );
		}

	}//dijon.Dictionary.prototype

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
		this._mappings = new dijon.Dictionary();

		/** @private */
		this._injectionPoints = [];
	}//dijon.Injector

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
			var value = this._mappings.getValue( clazz );
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
		 * @param target
		 * @param property
		 * @param clazz
		 */
		addInjectionPoint : function( target, property, clazz ){
			this._injectionPoints.push( {
				target : target,
				property : property,
				clazz : clazz
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
			this.mapSingletonOf( whenAskedFor, whenAskedFor );
		},

		/**
		 *
		 * @param whenAskedFor
		 * @param useValue
		 */
		mapValue : function( whenAskedFor, useValue ){
			this._mappings.add(
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
			return this._mappings.hasValue( whenAskedFor );
		},

		/**
		 *
		 * @param whenAskedFor
		 * @param instantiateClass
		 */
		mapClass : function( whenAskedFor, instantiateClass ){
			this._mappings.add(
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
			this._mappings.add(
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
			this._mappings.remove( whenAskedFor );
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

	}//dijon.Injector.prototype


	global.dijon = dijon;
	
}( window || global || this ));












