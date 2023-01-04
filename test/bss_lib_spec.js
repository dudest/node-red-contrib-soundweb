const assert = require('assert');
const bssLib = require('../lib/bss_lib');


describe('bss_lib.js', function() {
    describe('checkSum', function() {
        it ('<buffer 01 02 03 04 05 06> should return <buffer 07>', function() {
            var actual = bssLib.calculateChecksum(Buffer.from([0x01,0x02,0x03,0x04,0x05,0x06]));
            var expected = Buffer.from([0x07]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('byteSubstitute', function() {
        it ('<buffer 02 03 06 15 1b> should return <buffer 1b 82 1b 83 1b 86 1b 95 1b 9b>', function() {
            var actual = bssLib.byteSubstitute(Buffer.from([0x02,0x03,0x06,0x15,0x1b]));
            var expected = Buffer.from([0x1b,0x82,0x1b,0x83,0x1b,0x86,0x1b,0x95,0x1b,0x9b]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('byteUnubstitute', function() {
        it ('<buffer 1b 82 1b 83 1b 86 1b 95 1b 9b> should return <buffer 02 03 06 15 1b>', function() {
            var actual = bssLib.byteUnsubstitute(Buffer.from([0x1b,0x82,0x1b,0x83,0x1b,0x86,0x1b,0x95,0x1b,0x9b]));
            var expected = Buffer.from([0x02,0x03,0x06,0x15,0x1b]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('encapsulateCommand', function() {
        it ('<buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 02 8d 10 1b 82 1b 83 00 01 0f 00 60 00 34 e8 ff d1 03>',
        function() {
            var actual = bssLib.encapsulateCommand(Buffer.from([0x8d,0x10,0x02,0x03,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff]));
            var expected = Buffer.from([0x02,0x8d,0x10,0x1b,0x82,0x1b,0x83,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff,0xd1,0x03]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('decapsulateCommand', function() {
        it ('<buffer 02 8d 10 1b 82 1b 83 00 01 0f 00 60 00 34 e8 ff d1 03> should return <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff>',
        function() {
            var actual = bssLib.decapsulateCommand(Buffer.from([0x02,0x8d,0x10,0x1b,0x82,0x1b,0x83,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff,0xd1,0x03]));
            var expected = Buffer.from([0x8d,0x10,0x02,0x03,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('getCommandIdBuffer', function() {
        it ('<buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 8d>',
        function() {
            var actual = bssLib.getCommandIdBuffer(Buffer.from([0x8d,0x10,0x02,0x03,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff]));
            var expected = Buffer.from([0x8d]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('getAddressBuffer', function() {
        it ('<buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 10 02 03 00 01 0f 00 60>',
        function() {
            var actual = bssLib.getAddressBuffer(Buffer.from([0x8d,0x10,0x02,0x03,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff]));
            var expected = Buffer.from([0x10,0x02,0x03,0x00,0x01,0x0f,0x00,0x60]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('getDataBuffer', function() {
        it ('<buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 00 34 e8 ff>',
        function() {
            var actual = bssLib.getDataBuffer(Buffer.from([0x8d,0x10,0x02,0x03,0x00,0x01,0x0f,0x00,0x60,0x00,0x34,0xe8,0xff]));
            var expected = Buffer.from([0x00,0x34,0xe8,0xff]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('encDiscrete', function () {
        it('10 should return <buffer 00 00 00 0a>',
            function () {
                var actual = bssLib.encDiscrete(10);
                var expected = Buffer.from([0x00, 0x00, 0x00, 0x0a]);
                assert.deepEqual(actual, expected);
            });
    });
    describe('decDiscrete', function () {
        it('<buffer 00 00 00 0b> should return 11',
            function () {
                var actual = bssLib.decDiscrete(Buffer.from([0x00, 0x00, 0x00, 0x0b]));
                var expected = 11;
                assert.deepEqual(actual, expected);
            });
    });
    describe('encPercent', function() {
        it ('12.5 should return <buffer 00 0c 80 00>',
        function() {
            var actual = bssLib.encPercent(12.5);
            var expected = Buffer.from([0x00,0x0c,0x80,0x00]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('decPercent', function() {
        it ('<buffer 00 0c 80 00> should return 12.5',
        function() {
            var actual = bssLib.decPercent(Buffer.from([0x00,0x0c,0x80,0x00]));
            var expected = 12.5;
            assert.deepEqual(actual, expected);
        });
    });
    describe('encGain', function() {
        it ('-15dB should return <buffer ff fd ef ce>',
        function() {
            var actual = bssLib.encGain(-15);
            var expected = Buffer.from([0xff,0xfd,0xef,0xce]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('decGain', function() {
        it('<buffer ff fd ef ce> should return roughly -15dB (-14.999956513820392)',
        function() {
            var actual = bssLib.decGain(Buffer.from([0xff,0xfd,0xef,0xce]));
            var expected = -14.999956513820392;
            assert.deepEqual(actual, expected);
        });
    });
    describe('encScalarLinear', function() {
        it ('5 should return <buffer 00 00 c3 50>',
        function() {
            var actual = bssLib.encScalarLinear(5);
            var expected = Buffer.from([0x00,0x00,0xc3,0x50]);
            assert.deepEqual(actual, expected);
        });
    });
    describe('decScalarLinear', function() {
        it ('<buffer 00 00 c3 50> should return 5',
        function() {
            var actual = bssLib.decScalarLinear(Buffer.from([0x00,0x00,0xc3,0x50]));
            var expected = 5;
            assert.deepEqual(actual, expected);
        });
    });
    describe('encDelay', function () {
        it('5 should return <buffer 00 00 01 e0>',
            function () {
                var actual = bssLib.encDelay(5);
                var expected = Buffer.from([0x00, 0x00, 0x01, 0xe0]);
                assert.deepEqual(actual, expected);
            });
    });
    describe('decDelay', function () {
        it('<buffer 00 00 01 e0> should return 5',
            function () {
                var actual = bssLib.decDelay(Buffer.from([0x00, 0x00, 0x01, 0xe0]));
                var expected = 5;
                assert.deepEqual(actual, expected);
            });
    });
    describe('encFrequencyOrSpeed', function () {
        it('5 should return <buffer 00 0a aa 5a>',
            function () {
                var actual = bssLib.encFrequencyOrSpeed(5);
                var expected = Buffer.from([0x00, 0x0a, 0xaa, 0x5a]);
                assert.deepEqual(actual, expected);
            });
    });
    describe('decFrequencyOrSpeed', function () {
        it('<buffer 00 0a aa 5a> should return roughly 5 (4.999999950079738)',
            function () {
                var actual = bssLib.decFrequencyOrSpeed(Buffer.from([0x00, 0x0a, 0xaa, 0x5a]));
                var expected = 4.999999950079738;
                assert.deepEqual(actual, expected);
            });
    });
});