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
	VERSION : '0.5.0'
};//dijon


  //======================================//
 // dijon.System
//======================================//

/**
 * @class dijon.System
 * @constructor
*/
dijon.System = function(){
	/** @private */
	this._mappings = {};

	/** @private */
	this._outlets = {};

    /** @private */
    this._handlers = {};

    /** @private */
    this._callbacks = {};

    this.strictInjections = true;
};//dijon.System

dijon.System.prototype = {

	/**
	 * @private
	 * @param {Class} clazz
	 */
	_createAndSetupInstance : function( key, clazz ){
		var instance = new clazz();
		this.injectInto( key, instance );
		if( "setup" in instance ) instance.setup.call( instance );
		return instance;
	},

	/**
	 * @private
	 * @param {String} key
	 * @param {Boolean} overrideRules
	 * @return {Object}
	 */
	_retrieveFromCacheOrCreate : function( key, overrideRules ){
        if( overrideRules == undefined ) overrideRules = false;
        if( this._mappings.hasOwnProperty( key ) ){
            var config = this._mappings[ key ];
            var output = null;
            if( !overrideRules && config.isSingleton ){
                if( config.object == null  ){
                    config.object = this._createAndSetupInstance( key, config.clazz );
                }
                output = config.object;
            }else{
                if( config.clazz ) output = this._createAndSetupInstance( key, config.clazz );
            }
        }else{
            throw new Error( 1020 );
        }
		return output
	},


	/**
	 * defines <code>propertyName</code> as an injection point for the class mapped to <code>targetKey</code> to be injected with an instance
	 * of the class mapped to <code>sourceKey</code>.
	 * @param {String} target the class the injection point is applied to.
	 * @param {String} outlet the <strong>name</strong> of the property used as an injection point.<br/>
	 * [!] MUST BE STRING
	 * @param {String} source the key to the value that will be injected
     * @see dijon.System#removeOutlet
	 */
	mapOutlet : function( source, target, outlet ){
	    if( source == undefined ) throw new Error( 1010 );
        if( target == undefined ) target = "global";
        if( outlet == undefined ) outlet = source;
        if( ! this._outlets.hasOwnProperty( target ) ) this._outlets[ target ] = {};
		this._outlets[ target ][ outlet ] = source
	},

	/**
	 * Create (if possible) or retrieve an instance of the class mapped to <code>key</code>
	 * @param {Object} key
	 * @return {Object}
	 */
	getInstance : function( key ){
	    if( key == undefined ) throw new Error( 1010 )
		return this._retrieveFromCacheOrCreate( key );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or object <code>whenAskedFor</code> inject the instance <code>useValue</code>.
	 * @param {String} key
	 * @param {Object} useValue
	 */
	mapValue : function( key, useValue ){
	    if( key == undefined ) throw new Error( 1010 );
		this._mappings[ key ]= {
            clazz : null,
            object : useValue,
            isSingleton : true
		}
	},

	/**
	 * Does a rule exist to satsify such a request?
	 * @param {String} key
	 * @return {Boolean}
	 */
	hasMapping : function( key ){
	    if( key == undefined ) throw new Error( 1010 );
		return this._mappings.hasOwnProperty( key );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or for object <code>whenAskedFor</code> inject a <strong>new</strong> instance of <code>instantiateClass</code>.
	 * @param {String} key
	 * @param {Class} clazz
	 */
	mapClass : function( key, clazz ){
	    if( key == undefined ) throw new Error( 1010 );
	    if( key == undefined ) throw new Error( 1010 );
		this._mappings[ key ]= {
				clazz : clazz,
				object : null,
				isSingleton : false
        }
	},

    /**
     * When asked for an instance of the class <code>whenAskedFor</code> or object <code>whenAskedFor</code> inject an instance of <code>useSingletonOf</code>.
     * @param {String} key
     * @param {Class} clazz
     */
    mapSingleton : function( key, clazz ){
        if( key == undefined ) throw new Error( 1010 );
        if( clazz == undefined ) throw new Error( 1010 );
        this._mappings[ key ] = {
            clazz : clazz,
            object : null,
            isSingleton : true
        }
    },

	/**
	 * create an instance of the class mapped to <code>keyOrClass</code> and fulfill it's mapped dependencies<br/>
	 * <strong>WILL ALWAYS CREATE A NEW INSTANCE</strong>, even if <code>keyOrClass</code> was mapped otherwise or
	 * <strong>even when <code>keyOrClass</code> was not mapped</code>.
	 * @param {Class} keyOrClass
	 * @return {Object}
	 */
	instantiate : function( key ){
        if( key == undefined ) throw new Error( 1010 );
		return this._retrieveFromCacheOrCreate( key, true );
	},

	/**
	 * Perform an injection into an object, satisfying all it's dependencies
	 * @param {String} key
	 * @param {Object} instance
	 */
	injectInto : function( key, instance ){
        if( key == undefined ) throw new Error( 1010 );
        if( instance == undefined ) throw new Error( 1010 );
        var o = [];
        if( this._outlets.hasOwnProperty( 'global' ) ) o.push( this._outlets[ 'global' ] );
        if( this._outlets.hasOwnProperty( key ) ) o.push( this._outlets[ key ] );
        for( var i in o ){
            var l = o [ i ];
            for( var outlet in l ){
                var source = l[ outlet ];
                //must be "in" [!]
                if( ! this.strictInjections || outlet in instance ) instance[ outlet ] = this.getInstance( source );
            }
        }

        return instance;
	},

	/**
	 * Remove a rule from the System
	 * @param {String} key
	 */
	unmap : function( key ){
        if( key == undefined ) throw new Error( 1010 );
		delete this._mappings[ key ];
	},

	/**
	 * removes an injection point mapping for a given class mapped to <code>key</code>
	 * @param {String} key
	 * @param {String} propertyName MUST BE STRING
	 * @see dijon.System#addOutlet
	 */
	unmapOutlet : function( target, outlet ){
        if( target == undefined ) throw new Error( 1010 );
        if( outlet == undefined ) throw new Error( 1010 );
		delete this._outlets[ target ][ outlet ];
	},

    /**
     *
     * @param {String} eventName
     * @param {String} key
     * @param {String|Function} [handler=eventName]
     * @param {Boolean} [oneShot=false]
     */
    mapHandler : function( eventName, key, handler, oneShot ){
        if( eventName == undefined ) throw new Error( 1010 );
        if( key == undefined ) throw new Error( 1010 );
        if( handler == undefined ) handler = eventName;
        if( oneShot == undefined ) oneShot = false;
        if( ! this._handlers.hasOwnProperty( eventName ) ){
            this._handlers[ eventName ] = {};
        }
        if( ! this._handlers[eventName].hasOwnProperty( key ) ){
            this._handlers[eventName][key] = [];
        }
        this._handlers[ eventName ][ key ].push( {
            handler : handler,
            oneShot: oneShot
        } );
    },

    /**
     *
     * @param {String} eventName
     * @param {String} key
     * @param {String | Function} [handler=eventName]
     */
    unmapHandler : function( eventName, key, handler  ){
        if( eventName == undefined ) throw new Error( 1010 );
        if( key == undefined ) throw new Error( 1010 );
        if( handler == undefined ) handler = eventName;
        if( this._handlers.hasOwnProperty( eventName ) && this._handlers[ eventName ].hasOwnProperty( key ) ){
            var handlers = this._handlers[ eventName ][ key ];
            for( var i in handlers ){
                if( handlers[ i ] == handler ){
                    handlers.splice( i, 1 );
                    return;
                }
            }
        }
    },

    /**
     *
     * @param {String} eventName
     * @param {Function} callback
     * @param {Boolean} [oneShot=false]
     */
    addCallback : function( eventName, callback, oneShot ){
        if( eventName == undefined ) throw new Error( 1010 );
        if( callback == undefined ) throw new Error( 1010 );
        if( oneShot == undefined ) oneShot = false;
        if( ! this._callbacks.hasOwnProperty( eventName ) ){
            this._callbacks[ eventName ] = [];
        }
        this._callbacks[ eventName ].push( {
            callback : callback,
            oneShot : oneShot
        } );
    },

    /**
     *
     * @param {String} eventName
     * @param {Function} callback
     */
    removeCallback : function( eventName, callback ){
        if( eventName == undefined ) throw new Error( 1010 );
        if( callback == undefined ) throw new Error( 1010 );
        if( this._callbacks.hasOwnProperty( eventName ) ){
            var configs = this._callbacks[ eventName ];
            for( var i in configs ){
                var config = configs[ i ];
                if( config.callback === callback ) configs.splice( i, 1 );
            }
        }
    },

    /**
     *
     * @param {String} eventName
     */
    notify : function( eventName ){
        if( eventName == undefined ) throw new Error( 1010 );
        var args = Array.prototype.slice( arguments );
        if( this._handlers.hasOwnProperty( eventName ) ){
            var handlers = this._handlers[ eventName ];
            for( var key in handlers ){
                var configs = handlers[ key ];
                var instance = this.getInstance( key );
                for( var i in configs ){
                    var handler;
                    var config = configs[ i ];
                    if( typeof config.handler == "string" ){
                        handler = instance[ config.handler ];
                    }else{
                        handler = config.handler;
                    }
                    if( config.oneShot ) this.unmapHandler( key, eventName, config.handler );
                    handler.apply( instance, args );
                }
            }
        }
        if( this._callbacks.hasOwnProperty( eventName ) ){
            var callbacks = this._callbacks[ eventName ];
            for( var i in callbacks ){
                var config = callbacks[ i ];
                if( config.oneShot ) callbacks.splice( i, 1 );
                config.callback.apply( null, args );
            }
        }
    }

};//dijon.System.prototype

/*
    system.addHandler( 'userController', 'loginStart' );
    system.notify( 'loginStart' );
 */
