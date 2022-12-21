const assert = require('assert');
const bssLib = require('../lib/bss_lib');


describe('bss_lib', function() {
    describe('checkSum', function() {
        it ('<buffer 01 01> should return <buffer 00>', function() {
            var actual = bssLib.calculateChecksum(Buffer.from([1, 1]));
            var expected = Buffer.from([0]);
            assert.deepEqual(actual, expected);
        });
        it ('<buffer 01 01 01> should return <buffer 01>', function() {
            var actual = bssLib.calculateChecksum(Buffer.from([1, 1, 1]));
            var expected = Buffer.from([1]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('byteSubstitute', function() {
        it ('<buffer 01 02 03> should return <buffer 01 1b 82 1b 83>', function() {
            var actual = bssLib.byteSubstitute(Buffer.from([1, 2, 3]));
            var expected = Buffer.from([1, 27, 130, 27, 131]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('byteUnubstitute', function() {
        it ('<buffer 01 1b 82 1b 83> should return <buffer 01 02 03>', function() {
            var actual = bssLib.byteUnsubstitute(Buffer.from([1, 27, 130, 27, 131]));
            var expected = Buffer.from([1, 2, 3]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('encapsulateCommand', function() {
        it ('<buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 02 8d 10 1b 82 1b 83 00 01 0f 00 60 00 34 e8 ff d1 03>',
        function() {
            var actual = bssLib.encapsulateCommand(Buffer.from([141,16,2,3,0,1,15,0,96,0,52,232,255]));
            var expected = Buffer.from([2,141,16,27,130,27,131,0,1,15,0,96,0,52,232,255,209,3]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('decapsulateCommand', function() {
        it ('<buffer 02 8d 10 1b 82 1b 83 00 01 0f 00 60 00 34 e8 ff d1 03> should return <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff>',
        function() {
            var actual = bssLib.decapsulateCommand(Buffer.from([2,141,16,27,130,27,131,0,1,15,0,96,0,52,232,255,209,3]));
            var expected = Buffer.from([141,16,2,3,0,1,15,0,96,0,52,232,255]);
            assert.deepEqual(actual, expected);
        });
    });
});