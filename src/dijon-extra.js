/**
 * @author Camille Reynders
 * Date: 16/10/11
 * Time: 09:16
 */

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

};

  //======================================//
 // dijon.CommandMap
//======================================//

/**
 * @class dijon.CommandMap
 * @constructor
 */
dijon.CommandMap = function(){

	this.fqn = 'dijon.CommandMap';

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
		this.eventMap.addClassMapping( eventType, commandClazz, 'execute', oneShot, passEvent );
	},

	/**
	 *
	 * @param {String} eventType
	 * @param {Class} commandClazz
	 */
	unmapEvent : function( eventType, commandClazz ){
		this.eventMap.removeClassMapping( eventType, commandClazz, 'execute' );
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

