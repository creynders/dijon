    /**
     * Created by JetBrains WebStorm.
     * User: creynder
     * Date: 21/09/11
     * Time: 14:53
     * To change this template use File | Settings | File Templates.
     */
    var injector;

    function TestClassA(){
        this.name = 'TestClassA';
    }

    function TestClassB(){
        this.name = 'TestClassB';

        this.bar = undefined;
    }

    //TODO: test Injectro#setValue

    module( 'dijon.Injector', {
        setup : function(){
            injector = new dijon.System();
        },
        teardown : function(){
            injector = undefined;
        }
    });

    test( 'mapSingleton', function(){
        injector.mapSingleton( 'a', TestClassA );
        ok( injector.hasMapping( 'a' ) );
    })

    test( 'mapValue', function(){
        var a = new TestClassA();
        injector.mapValue( 'a', a );
        ok( injector.hasMapping( 'a' ) );
    })

    test( 'mapClass', function(){
        injector.mapClass( 'a', function(){} );
        ok( injector.hasMapping( 'a' ) );
    })

    test( 'getObject for mapSingleton', function(){
        injector.mapSingleton( 'a', TestClassA );
        var inj = injector;
        var a = injector.getObject( 'a' );
        ok( a instanceof TestClassA, 'must be instance of TestClassA' );
        strictEqual( injector.getObject( 'a' ), a, 'must be single instance' );
    })

    test( 'getObject for mapClass', function(){
        injector.mapClass( 'a', TestClassA );
        var a = injector.getObject( 'a' );
        ok( a instanceof TestClassA );
        notStrictEqual( injector.getObject( 'a' ), a );
    })

    test( 'getObject for mapValue', function(){
        var a = new TestClassA();
        injector.mapValue( 'a', a );
        strictEqual( injector.getObject( 'a' ), a );
    })

    test( 'instantiate for mapSingleton', function(){
        injector.mapSingleton( 'a', TestClassA );
        var a = injector.getObject( 'a' );
        notStrictEqual( injector.instantiate( 'a' ), a, 'instantiate must always provide a new instance regardless of rules' );
    })


    test( 'instantiate for mapClass', function(){
        injector.mapClass( 'a', TestClassA );
        var a = injector.getObject( 'a' );
        notStrictEqual( injector.instantiate( 'a' ), a );
    })

    test( 'instantiate for mapValue', function(){
        var a = new TestClassA();
        injector.mapValue( 'a', a );
        notStrictEqual( injector.instantiate( 'a' ), a );
    })

    test( 'unmap', function(){
        injector.mapSingleton( 'a', TestClassA )
        injector.unmap( 'a' );
        ok( ! injector.hasMapping( 'a' ) );
    })

    test( 'addOutlet', function(){
        injector.mapSingleton( 'a', TestClassA );
        injector.mapSingleton( 'b', TestClassB );
        injector.mapOutlet( 'a', 'b', 'bar' );
        var b = injector.getObject( 'b' );
        ok( b.bar instanceof TestClassA );
    })

    test( 'removeOutlet', function() {
        injector.mapSingleton( 'a', TestClassA );
        injector.mapSingleton( 'b', TestClassB );
        injector.mapOutlet( 'a', 'b', 'bar' );
        injector.unmapOutlet( 'b', 'bar' );
        var b = injector.getObject( 'b' );
        strictEqual( b.bar, undefined );
    })
    test( 'addHandler: simple use', function(){
        var hasExecuted = false;
        var c = function(){
            this.loginStart = function(){
                hasExecuted = true;
            }
        }
        injector.mapSingleton( 'a', c );
        injector.mapHandler( 'loginStart', 'a' )
        injector.notify( 'loginStart' );
        ok( hasExecuted );
    })

    test( 'addHandler: oneShot', function(){
        var hasExecuted = 0;
        var c = function(){
            this.loginStart = function(){
                hasExecuted++;
            }
        }
        injector.mapSingleton( 'a', c );
        injector.mapHandler( 'loginStart', 'a', null, true );
        injector.notify( 'loginStart' );
        injector.notify( 'loginStart' );
        injector.notify( 'loginStart' );
        injector.notify( 'loginStart' );
        injector.notify( 'loginStart' );
        ok( hasExecuted==1);
    })

    test( 'addHandler: diffreten handler name', function(){
         var hasExecuted = false;
         var c = function(){
             this.onLoginStart = function(){
                 hasExecuted = true;
             }
         }
         injector.mapSingleton( 'a', c );
         injector.mapHandler( 'loginStart', 'a', 'onLoginStart' )
         injector.notify( 'loginStart' );
         ok( hasExecuted );
     })


    test( 'unmapHandler: simple use', function(){
        var hasExecuted = 0;
        var c = function(){
            this.loginStart = function(){
                hasExecuted++;
            }
        }
        injector.mapSingleton( 'a', c );
        injector.mapHandler( 'loginStart', 'a' );
        injector.notify( 'loginStart' );
        injector.notify( 'loginStart' );
        injector.unmapHandler( 'loginStart', 'a' );
        injector.notify( 'loginStart' );
        ok( hasExecuted == 2 );
    })

    test( 'addCallback: simple use', function(){
        var hasExecuted = false;
        var o = {
            loginStart : function(){
                hasExecuted = true;
            }
        }
        injector.addCallback( 'loginStart', o.loginStart );
        injector.notify( 'loginStart' );
        ok( hasExecuted );
    })


    test( 'removeCallback: simple use', function(){
        var hasExecuted = 0;
        var o = {
            loginStart : function(){
                hasExecuted ++;
            }
        }
        injector.addCallback( 'loginStart', o.loginStart );
        injector.notify( 'loginStart' );
        injector.notify( 'loginStart' );
        injector.removeCallback( 'loginStart', o.loginStart );
        ok( hasExecuted==2 );
    })

    test( 'notify: payload passing to callbacks', function(){
        var a = 'a';
        var b = {
            name : 'b'
        }
        var passed1;
        var passed2;
        var o = {
            foo : function( e, p1, p2 ){
                passed1 = p1;
                passed2 = p2;
            }
        }

        injector.addCallback( 'mofo', o.foo, true, true );
        injector.notify( 'mofo', a, b );
        equal( passed1, a );
        equal( passed2, b );
    })

    test( 'instantiate value', function(){
        var a = {
            name : 'a'
        }

        injector.mapValue( 'a', a );
        var inst  = injector.instantiate( 'a' );
        ok( inst !== a );
    })

    test( 'getInstance value', function(){
        var a = {
            name : 'a'
        }

        injector.mapValue( 'a', a );
        var inst  = injector.getObject( 'a' );
        ok( inst === a );
    })