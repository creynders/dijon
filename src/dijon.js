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
 // dijon.Injector
//======================================//

/**
 * @class dijon.Injector
 * @constructor
*/
dijon.Injector = function(){
	/** @private */
	this._mappings = {};

	/** @private */
	this._outlets = [];

    this.strictInjections = true;
};//dijon.Injector

dijon.Injector.prototype = {

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
	 * @param {Stirng} key
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
            throw new Error( this.fqn + " is missing a rule for " + key );
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
     * @see dijon.Injector#removeOutlet
	 */
	addOutlet : function( source, target, outlet ){
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
		return this._retrieveFromCacheOrCreate( key );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or object <code>whenAskedFor</code> inject the instance <code>useValue</code>.
	 * @param {String} key
	 * @param {Object} useValue
	 */
	mapValue : function( key, useValue ){
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
		return this._mappings.hasOwnProperty( key );
	},

	/**
	 * When asked for an instance of the class <code>whenAskedFor</code> or for object <code>whenAskedFor</code> inject a <strong>new</strong> instance of <code>instantiateClass</code>.
	 * @param {String} key
	 * @param {Class} clazz
	 */
	mapClass : function( key, clazz ){
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
		return this._retrieveFromCacheOrCreate( key, true );
	},

	/**
	 * Perform an injection into an object, satisfying all it's dependencies
	 * @param {Object} instance
	 */
	injectInto : function( key, instance ){
        var o = [ this._outlets[ 'global' ] ];
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
	 * Remove a rule from the injector
	 * @param {String} key
	 */
	unmap : function( key ){
		delete this._mappings[ key ];
	},

	/**
	 * removes an injection point mapping for a given class mapped to <code>key</code>
	 * @param {Object} key
	 * @param {String} propertyName MUST BE STRING
	 * @see dijon.Injector#addOutlet
	 */
	removeOutlet : function( target, outlet ){
		delete this._outlets[ target ][ outlet ];
	}

};//dijon.Injector.prototype

