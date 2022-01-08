import test from 'ava';
import Queue from '../lib/queue.js';

test('Queue: Test setConfig()', t => {
    let queue = new Queue();
    let customConfig = {
        maxStack: 2, // Max 1 call queued in the stack
        maxCalls: 5, // Max 5 calls per interval
        interval: 5000, // 5 second interval
    };
    queue.setConfig(customConfig);
    t.is(customConfig.maxStack, queue.config.maxStack, 'Custom config');
});

test('Queue: Test add() + getLength() + clear()', async t => {
    await new Promise(resolve => {
        let queue = new Queue();
        let customConfig = {
            maxStack: 2, // Max 1 call queued in the stack
            maxCalls: 5, // Max 5 calls per interval
            interval: 5000, // 5 second interval
        };
        queue.setConfig(customConfig);
        t.plan(5);

        var dummy = function () {
            return true;
        };
        function t1(err, remainingFree, remainingStack) {
            t.is(remainingFree, 0, 'Remaining free positions === 0');
            t.is(remainingStack, 2, 'Remaining stack positions === 2');
        }

        function t2(err, remainingFree, remainingStack) {
            t.is(err.statusCode, 429, 'Too many requests, err.statusCode === 429');
            resolve();
        }
        queue.add(dummy); //  1
        queue.add(dummy); //  2
        queue.add(dummy); //  3
        queue.add(dummy); //  4
        queue.add(t1); // 5 (last free call)
        queue.add(dummy); //  6 (first in the stack)
        queue.add(dummy); //  7 (second in the stack)
        queue.add(t2); // 8! Overflow
        t.is(queue._stack.length, 2, 'Stack is full');
        queue.clear(); // Empty stack
        t.is(queue._stack.length, 0, 'Stack has been cleared');
    });
});
