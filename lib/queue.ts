import { DiscogsError } from './error.js';
import { merge } from './util.js';

type QueueConfig = {
    maxStack: number;
    maxCalls: number;
    interval: number;
};

/**
 * Default configuration
 */
let defaultConfig: QueueConfig = {
    maxStack: 20, // Max 20 calls queued in the stack
    maxCalls: 60, // Max 60 calls per interval
    interval: 60000, // 1 minute interval
};

export default class Queue {
    config: QueueConfig;
    stack: Array<{ callback: Function; timeout: NodeJS.Timeout }>;
    firstCall: number;
    callCount: number;

    /**
     * Object constructor
     * @param {QueueConfig} [customConfig] - Optional custom configuration object
     */
    constructor(customConfig?: Partial<QueueConfig>) {
        // Set the default configuration
        // @ts-ignore
        this.config = merge({}, defaultConfig);
        if (customConfig && typeof customConfig === 'object') {
            this.setConfig(customConfig);
        }
        this.stack = [];
        this.firstCall = 0;
        this.callCount = 0;
    }

    /**
     * Override the default configuration
     * @param {Partial<QueueConfig>} customConfig - Custom configuration object
     * @returns {object}
     */
    setConfig(customConfig: Partial<QueueConfig>): object {
        merge(this.config, customConfig);
        return this;
    }

    /**
     * Add a function to the queue. Usage:
     *
     * @example
     * queue.add(function(err, freeCallsRemaining, freeStackPositionsRemaining){
     *     if(!err){
     *         // Do something
     *     }
     * });
     *
     * @param {(err: Error | null, freeCallsRemaining: number, freeStackPositionsRemaining: number) => any} callback - The function to schedule for execution
     * @returns {object}
     */
    add(callback: (err: Error | null, freeCallsRemaining: number, freeStackPositionsRemaining: number) => any): object {
        if (this.stack.length === 0) {
            let now = Date.now();
            // Within call interval limits: Just execute the callback
            if (this.callCount < this.config.maxCalls) {
                this.callCount++;
                if (this.callCount === 1) {
                    this.firstCall = now;
                }
                setTimeout(callback, 0, null, this.config.maxCalls - this.callCount, this.config.maxStack);
                // Upon reaching the next interval: Execute callback and reset
            } else if (now - this.firstCall > this.config.interval) {
                this.callCount = 1;
                this.firstCall = now;
                setTimeout(callback, 0, null, this.config.maxCalls - this.callCount, this.config.maxStack);
                // Within the interval exceeding call limit: Queue the call
            } else {
                this._pushStack(callback);
            }
            // Current stack is not empty and must be processed first, queue new calls
        } else {
            this._pushStack(callback);
        }
        return this;
    }

    /**
     * Push a callback on the callback stack to be executed
     * @param {Function} callback
     */
    _pushStack(callback: Function) {
        if (this.stack.length < this.config.maxStack) {
            let factor = Math.ceil(this.stack.length / this.config.maxCalls),
                timeout =
                    this.firstCall +
                    this.config.interval * factor -
                    Date.now() +
                    (this.stack.length % this.config.maxCalls) +
                    1;
            this.stack.push({
                callback: callback,
                timeout: setTimeout(this._callStack, timeout, this),
            });
        } else {
            // Queue max length exceeded: Pass an error to the callback
            setTimeout(callback, 0, new DiscogsError(429, 'Too many requests'), 0, 0);
        }
    }

    /**
     * Shift a function from the callback stack and call it
     * @param {Queue} [queue] - Async calls need the queue instance
     */
    _callStack(queue?: Queue) {
        queue = queue || this;
        queue.stack.shift()?.callback.call(queue, null, 0, queue.config.maxStack - queue.stack.length);
        queue.callCount++;
    }

    /**
     * Clear the request stack. All queued requests/callbacks will be cancelled!
     */
    clear() {
        let item;
        while ((item = this.stack.shift())) {
            clearTimeout(item.timeout);
        }
        return this;
    }
}
