    /**
     * Created by JetBrains WebStorm.
     * User: creynder
     * Date: 21/09/11
     * Time: 14:53
     * To change this template use File | Settings | File Templates.
     */
    var system;

    function TestClassA(){
        this.name = 'TestClassA';
    }

    function TestClassB(){
        this.name = 'TestClassB';

        this.bar = undefined;
    }

    //TODO: test Injectro#setValue

    module( 'dijon.system', {
        setup : function(){
            system = new dijon.System();
        },
        teardown : function(){
            system = undefined;
        }
    });

    test( 'mapSingleton', function(){
        system.mapSingleton( 'a', TestClassA );
        ok( system.hasMapping( 'a' ) );
    })

    test( 'mapValue', function(){
        var a = new TestClassA();
        system.mapValue( 'a', a );
        ok( system.hasMapping( 'a' ) );
    })

    test( 'mapClass: hasMapping', function(){
        system.mapClass( 'a', function(){} );
        ok( system.hasMapping( 'a' ) );
    })

    test( 'mapClass: unique instances', function(){
        var SomeClass = function(){
        }
        system.mapClass( 'o', SomeClass );

        var s1 = system.getObject( 'o' );
        var s2 = system.getObject( 'o' );

        ok( s1 instanceof SomeClass );
        ok( s2 instanceof SomeClass );
        notEqual( s1, s2 );
    })

    test( 'injectInto', function(){
        var UserModel = function(){
        }
        system.mapSingleton( 'userModel', UserModel );
        var SomeClass = function(){
             user = undefined; //inject
        }
        system.mapSingleton( 'o', SomeClass );
        system.mapOutlet( 'userModel', 'o', 'user' );

        var foo = {
              user : undefined //inject
        }

        system.injectInto( foo, 'o' );

        strictEqual( foo.user, system.getObject( 'userModel' ) );
    })

    test( 'getObject for mapSingleton', function(){
        system.mapSingleton( 'a', TestClassA );
        var inj = system;
        var a = system.getObject( 'a' );
        ok( a instanceof TestClassA, 'must be instance of TestClassA' );
        strictEqual( system.getObject( 'a' ), a, 'must be single instance' );
    })

    test( 'getObject for mapClass', function(){
        system.mapClass( 'a', TestClassA );
        var a = system.getObject( 'a' );
        ok( a instanceof TestClassA );
        notStrictEqual( system.getObject( 'a' ), a );
    })

    test( 'getObject for mapValue', function(){
        var a = new TestClassA();
        system.mapValue( 'a', a );
        strictEqual( system.getObject( 'a' ), a );
    })

    test( 'instantiate for mapSingleton', function(){
        system.mapSingleton( 'a', TestClassA );
        var a = system.getObject( 'a' );
        notStrictEqual( system.instantiate( 'a' ), a, 'instantiate must always provide a new instance regardless of rules' );
    })


    test( 'instantiate for mapClass', function(){
        system.mapClass( 'a', TestClassA );
        var a = system.getObject( 'a' );
        notStrictEqual( system.instantiate( 'a' ), a );
    })

    test( 'instantiate for mapValue', function(){
        var a = new TestClassA();
        system.mapValue( 'a', a );
        var result = system.instantiate( 'a' );
        strictEqual( result, a );
    })

    test( 'unmap', function(){
        system.mapSingleton( 'a', TestClassA )
        system.unmap( 'a' );
        ok( ! system.hasMapping( 'a' ) );
    })

    test( 'mapOutlet: all params given', function(){
        system.mapSingleton( 'userModel', TestClassA );
        var o = {
            user : undefined //inject
        }
        system.mapOutlet( 'userModel', 'o', 'user' );
        system.mapValue( 'o', o );

        var obj = system.getObject( 'o' );
        ok( obj.user instanceof TestClassA );
    })

    test( 'mapOutlet: source and target given', function(){
        system.mapSingleton( 'userModel', TestClassA );
        var o = {
            userModel : undefined //inject
        }
        system.mapOutlet( 'userModel', 'o' );
        system.mapValue( 'o', o );

        var obj = system.getObject( 'o' );
        ok( obj.userModel instanceof TestClassA );
    })

    test( 'mapOutlet: source given', function(){
        system.mapSingleton( 'userModel', TestClassA );
        system.mapOutlet( 'userModel' );
        var o = {
            userModel : undefined //inject
        }
        system.mapValue( 'o', o );

        var obj = system.getObject( 'o' );
        ok( obj.userModel instanceof TestClassA );
    })

    test( 'removeOutlet', function() {
        system.mapSingleton( 'a', TestClassA );
        system.mapSingleton( 'b', TestClassB );
        system.mapOutlet( 'a', 'b', 'bar' );
        system.unmapOutlet( 'b', 'bar' );
        var b = system.getObject( 'b' );
        strictEqual( b.bar, undefined );
    })
    test( 'addHandler: simple use', function(){
        var hasExecuted = false;
        var c = function(){
            this.loginStart = function(){
                hasExecuted = true;
            }
        }
        system.mapSingleton( 'a', c );
        system.mapHandler( 'loginStart', 'a' )
        system.notify( 'loginStart' );
        ok( hasExecuted );
    })

    test( 'addHandler: oneShot', function(){
        var hasExecuted = 0;
        var c = function(){
            this.loginStart = function(){
                hasExecuted++;
            }
        }
        system.mapSingleton( 'a', c );
        system.mapHandler( 'loginStart', 'a', null, true );
        system.notify( 'loginStart' );
        system.notify( 'loginStart' );
        system.notify( 'loginStart' );
        system.notify( 'loginStart' );
        system.notify( 'loginStart' );
        ok( hasExecuted==1);
    })

    test( 'addHandler: diffreten handler name', function(){
         var hasExecuted = false;
         var c = function(){
             this.onLoginStart = function(){
                 hasExecuted = true;
             }
         }
         system.mapSingleton( 'a', c );
         system.mapHandler( 'loginStart', 'a', 'onLoginStart' )
         system.notify( 'loginStart' );
         ok( hasExecuted );
     })


    test( 'unmapHandler: simple use', function(){
        var hasExecuted = 0;
        var c = function(){
            this.loginStart = function(){
                hasExecuted++;
            }
        }
        system.mapSingleton( 'a', c );
        system.mapHandler( 'loginStart', 'a' );
        system.notify( 'loginStart' );
        system.notify( 'loginStart' );
        system.unmapHandler( 'loginStart', 'a' );
        system.notify( 'loginStart' );
        ok( hasExecuted == 2 );
    })
