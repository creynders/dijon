/**
 * @author Camille Reynders
 * Date: 30/09/11
 * Time: 13:28
 */

dijondemo.viewEvents = {
	loadTwitterStream : 'dijondemo.viewEvents.loadTwitterStream'
}

$(document).ready( function(){
	
	/** @type dijondemo.DemoContext */
	var demoContext = new dijondemo.DemoContext();
	demoContext.init();
	/** @type dijon.EventDispatcher */
	var system = demoContext.eventDispatcher;

	system.addListener( dijondemo.systemEvents.twitterStreamLoaded, streamLoaded );
	
	$('#loadTwitterStreamButton').click( function(){
		console.log( 'load the tweets!' );
		system.dispatchEvent( dijondemo.viewEvents.loadTwitterStream, $( '#username' ).val(), $( '#numTweets' ).val() );
	});

	function streamLoaded( tweets ){
		console.log( tweets );
		if( tweets && tweets.length > 0 ){
			var user = tweets[ 0 ].user;
			$( '#avatar' ).attr( 'src', user.profile_image_url );
			$( '#profileURL' ).attr( 'href', 'http://www.twitter.com/#!/' + user.screen_name );
			$( '#usernameHeading' ).replaceWith( user.screen_name )
			$.each( tweets, function( index, value ){

				$('#tweetsList').append( "<li>"+value.text+"</li>");
			});
			$.mobile.changePage( '#tweetsListPage' );
		}
	}
});	