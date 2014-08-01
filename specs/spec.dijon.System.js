/**
 * @author Camille Reynders
 * Date: 25/04/12
 * Time: 08:18
 */

describe( "dijon.System", function(){
    "use strict";
    var keyA = 'supportA';
    var keyB = 'supportB';

    function SupportClassA(){
        this.name = 'SupportClassA';
        this.outlet = undefined;
        this.callback = undefined;
        this.setup = function(){
            this.callback && this.callback.call(this,this);
        }
    }

    function SupportClassB(){
        this.name = 'SupportClassB';

        this.bar = undefined;
    }

	var system;
	beforeEach( function(){
		system = new dijon.System();
        this.addMatchers({
            toBeInstanceOf : function( expected ){
                return this.actual instanceof expected;
            }
        });
	});

	afterEach( function(){
		system = undefined;
	});

    describe("instance", function(){
        it('should be of type dijon.System', function(){
            expect(system ).toBeInstanceOf(dijon.System);
        });
        it( 'should have strict injections by default', function(){
            expect(system.strictInjections ).toBeTruthy();
        });
        it('should not automap outlets by default', function(){
           expect(system.autoMapOutlets ).toBeFalsy();
        });
        it('should have "setup" as the post construction hook by default',function(){
            expect(system.postInjectionHook ).toEqual('setup');
        });
        it('should throw an error when trying to retrieve unmapped',function(){
            expect(function(){system.getObject(keyA)}).toThrow('no mapping found for this key');
        });
        it('should call the post injection hook', function(){
            var called = false;
            var singleton = function(){};
            singleton.prototype.setupSpy = function(){
                called = true;
            };
            system.postInjectionHook = 'setupSpy';
            system.mapSingleton('postInjectionHookTest', singleton );
            system.instantiate('postInjectionHookTest');
            expect(called ).toBeTruthy();
        });
    });
    describe('a mapped singleton',function(){
        beforeEach( function(){
            system.mapSingleton(keyA, SupportClassA);
        });
        it('should be determinable',function(){
            expect(system.hasMapping(keyA) ).toBeTruthy();
        });
        it('should produce an instance of the mapped class',function(){
            var instance = system.getObject(keyA);
            expect(instance).toBeInstanceOf(SupportClassA);
        });
        it('should produce a unique instance',function(){
            var instance1 = system.getObject(keyA);
            var instance2 = system.getObject(keyA);
            expect(instance1).toBe(instance2);
        });
        it('should be instantiatable by brute force',function(){
            var instance1 = system.getObject(keyA);
            var instance2 = system.instantiate(keyA);
            expect(instance1).not.toBe(instance2);
        });
        it('should have its postconstruct method called once',function(){
            var callbackKey = 'callbackKey';
            var called = 0;
            system.mapValue(callbackKey,function(passed){
                called++;
            });
            system.mapOutlet(callbackKey,keyA,'callback');
            system.getObject(keyA);
            system.getObject(keyA);
            expect(called).toEqual(1);
        });
        describe('and his dependencies', function(){
            beforeEach( function(){
                system.mapClass(keyB,SupportClassB);
                system.mapOutlet(keyB, keyA, 'outlet');
            });
            it('should get satisfied when retrieved',function(){
                var instance = system.getObject(keyA);
                expect(instance.outlet).toBeInstanceOf(SupportClassB);
            });
            it('should be satisfied once',function(){
                var instance1 = system.getObject(keyA);
                var instance2 = system.getObject(keyA);
                expect(instance1.outlet).toBe(instance2.outlet);
            });
        });
    });
    describe('a mapped value',function(){
        var valueA = new SupportClassA();
        beforeEach( function(){
            system.mapClass(keyB,SupportClassB);
            system.mapOutlet(keyB,keyA,'outlet');
            system.mapValue(keyA,valueA);
        });
        it('should be determinable',function(){
            expect(system.hasMapping(keyA)).toBeTruthy();
        });
        it('should be retrievable',function(){
            expect(system.getObject(keyA) ).toEqual(valueA);
        });
        it('should always return the same value',function(){
            expect(system.getObject(keyA) ).toEqual(system.getObject(keyA));
        });
        it('should not be overridden by brute force',function(){
            var instance1 = system.getObject(keyA);
            var instance2 = system.instantiate(keyA);
            expect(instance1).toBe(instance2);
        });
        describe('and his dependencies', function(){
            it('should be satisfied',function(){
                var instance = system.getObject(keyA);
                expect(instance.outlet).toBeInstanceOf(SupportClassB);
            });
        });
    });
    describe('a mapped class',function(){
        beforeEach( function(){
            system.mapClass(keyA,SupportClassA);
        });
        it('should be determinable',function(){
            expect(system.hasMapping(keyA)).toBeTruthy();
        });
        it('should produce an instance of the class',function(){
            expect(system.getObject(keyA)).toBeInstanceOf(SupportClassA);
        });
        it('should always return a new instance',function(){
            expect(system.getObject(keyA)).not.toBe(system.getObject(keyA));
        });
        it('should return a new instance by brute force',function(){
            var instance1 = system.getObject(keyA);
            var instance2 = system.instantiate(keyA);
            expect(instance1).not.toBe(instance2);
        });
        it('should have its postconstruct method called',function(){
            var callbackKey = 'callbackKey';
            var actual = undefined;
            system.mapValue(callbackKey,function(passed){
                actual = passed;
            });
            system.mapOutlet(callbackKey,keyA,'callback');
            var instance = system.getObject(keyA);
            expect(actual).toBe(instance);
        });
        describe('and his dependencies', function(){
            beforeEach( function(){
                system.mapClass(keyB,SupportClassB);
                system.mapOutlet(keyB, keyA, 'outlet');
            });
            it('should get satisfied when retrieved',function(){
                var instance = system.getObject(keyA);
                expect(instance.outlet).toBeInstanceOf(SupportClassB);
            });
            it('should be satisfied for each instance',function(){
                var instance1 = system.getObject(keyA);
                var instance2 = system.getObject(keyA);
                expect(instance1.outlet).not.toBe(instance2.outlet);
            });
        });
    });
    describe('unmapped objects',function(){
        beforeEach( function(){
            system.mapClass(keyB, SupportClassB);
        });
        it('should be injected with specified mapped dependencies',function(){
            system.mapOutlet(keyB, keyA, 'outlet');
            var instance = new SupportClassA();
            system.injectInto(instance,keyA);
            expect(instance.outlet ).toBeInstanceOf(SupportClassB);
        });
        it('should be injected with global mapped dependencies',function(){
            system.mapOutlet(keyB, 'global', 'outlet');
            var instance = new SupportClassA();
            system.injectInto(instance,keyA);
            expect(instance.outlet ).toBeInstanceOf(SupportClassB);
        });
        it('should have its postconstruct method called',function(){
            var callbackKey = 'callbackKey';
            var actual = undefined;
            system.mapValue(callbackKey,function(passed){
                actual = passed;
            });
            system.mapOutlet(callbackKey,keyA,'callback');
            var instance = new SupportClassA();
            system.injectInto(instance,keyA);
            expect(actual).toBe(instance);
        });
    });
    describe( 'a dispatched event',function(){
        beforeEach(function(){
            system.mapSingleton(keyA,SupportClassA);
        });
        it('should call the named method',function(){
            var callbackKey = 'callbackKey';
            var called = false;
            system.mapValue(callbackKey,function(){
                called=true;
            });
            system.mapOutlet(callbackKey,keyA,'callback');
            system.mapHandler('event',keyA,'callback');
            system.notify('event');
            expect(called).toBeTruthy();
        });
        it('should call an unattached handler',function(){
            var called = false;
            system.mapHandler('event',null,function(){
                called = true;
            });
            system.notify('event');
            expect(called).toBeTruthy();
        });
        it('should call a handler within the defined scope',function(){
            var actual = undefined;
            system.mapHandler('event',keyA,function(){
                actual = this;
            });
            system.notify('event');
            expect(actual).toBeInstanceOf(SupportClassA);
        });
        it('should call a handler every time',function(){
            var called = 0;
            system.mapHandler('event',null,function(){
                called++;
            });
            system.notify('event');
            system.notify('event');
            system.notify('event');
            system.notify('event');
            expect(called).toEqual(4);
        });
        it('should call a handler once when declared as such',function(){
            var called = 0;
            system.mapHandler('event',null,function(){
                called++;
            },true);
            system.notify('event');
            system.notify('event');
            system.notify('event');
            system.notify('event');
            expect(called).toEqual(1);
        });
        it('should pass itself when requested',function(){
            var actual;
            system.mapHandler('event',null,function(passed){
                actual=passed;
            },true,true);
            var expected ='event';
            system.notify(expected);
            expect(actual).toEqual(expected);
        });
        it('should pass the payload',function(){
            var actual;
            system.mapHandler('event',null,function(passed){
                actual=passed;
            });
            var expected = { value : 'payload' };
            system.notify('event',expected);
            expect(actual).toBe(expected);
        });
        it('should not call an unmapped handler',function(){
            var called = false;
            var handler =function(){
                called = true;
            };
            var event ='event';
            system.mapHandler(event, null, handler);
            system.unmapHandler(event, null, handler);
            system.notify(event);
            expect(called ).toBeFalsy();
        });
    });
});
