import { assert, async, test as _test } from 'wru';
import Queue from '../lib/queue.js';
var queue = new Queue();

var tests = (module.exports = [
    {
        name: 'Queue: Test setConfig()',
        test: function () {
            var customConfig = {
                maxStack: 2, // Max 1 call queued in the stack
                maxCalls: 5, // Max 5 calls per interval
                interval: 5000, // 5 second interval
            };
            queue.setConfig(customConfig);
            assert('Custom config', customConfig.maxStack === queue.config.maxStack);
        },
    },
    {
        name: 'Queue: Test add() + getLength() + clear()',
        test: function () {
            var dummy = function () {
                return true;
            };
            queue.add(dummy); //  1
            queue.add(dummy); //  2
            queue.add(dummy); //  3
            queue.add(dummy); //  4
            queue.add(
                async(function (err, remainingFree, remainingStack) {
                    // 5 (last free call)
                    assert('Remaining free positions === 0', remainingFree === 0);
                    assert('Remaining stack positions === 2', remainingStack === 2);
                })
            );
            queue.add(dummy); //  6 (first in the stack)
            queue.add(dummy); //  7 (second in the stack)
            queue.add(
                async(function (err) {
                    // 8! Overflow
                    assert('Too many requests, err.statusCode === 429', err && err.statusCode === 429);
                })
            );
            assert('Stack is full', queue._stack.length === 2);
            queue.clear(); // Empty stack
            assert('Stack has been cleared', queue._stack.length === 0);
        },
    },
]);

if (!module.parent) {
    _test(tests);
}
