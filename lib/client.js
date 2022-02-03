// @ts-check
import fetch, { Headers } from 'node-fetch';
import { DiscogsError, AuthError } from './error.js';
import { merge } from './util.js';
import Queue from './queue.js';
// import OAuth from 'oauth-1.0a';
import database from './database.js';
import marketplace from './marketplace.js';
import user from './user.js';
// @fixme
const version = '1.2.2';
const homepage = 'https://github.com/bartve/disconnect';

/**
 * @template ResponseData
 * @typedef {{data: ResponseData; rateLimit: RateLimit}} RateLimitedResponse<ResponseData>
 */

/**
 * @typedef {{host: string; port: number; userAgent: string; apiVersion: string; outputFormat: 'discogs' | 'plaintext' | 'html'; requestLimit: number; requestLimitAuth: number; requestLimitInterval: number }} ClientConfig
 * @typedef {{method: 'discogs' | 'oauth'; level: number; consumerKey: string; consumerSecret: string; userToken: string}} Auth
 * @typedef {{limit: number; used: number; remaining: number}} RateLimit
 * @typedef {(err?: Error, data?: unknown, rateLimit?: RateLimit) => any} RequestCallback
 * @typedef {{url: string, method?: 'GET'|'POST'|'PUT'|'DELETE', data?: Record<string, any>, queue?: boolean, json?: boolean; authLevel?: number }} RequestOptions
 * @typedef {{pagination: {per_page: number; pages: number; page: number; items: number; urls: {next: string; last: string; first?: string; prev?: string}}}} PaginationResponse
 */

/**
 * Default configuration
 * @type {ClientConfig}
 */
let defaultConfig = {
    host: 'api.discogs.com',
    port: 443,
    userAgent: `DisConnectClient/${version} +${homepage}`,
    apiVersion: 'v2',
    outputFormat: 'discogs', // Possible values: 'discogs' / 'plaintext' / 'html'
    requestLimit: 25, // Maximum number of requests to the Discogs API per interval
    requestLimitAuth: 60, // Maximum number of requests to the Discogs API per interval when authenticated
    requestLimitInterval: 60000, // Request interval in milliseconds
};

/**
 * Some resources represent collections of objects and may be paginated. By default, 50 items per page are shown.
 * To browse different pages, or change the number of items per page (up to 100), use the page and per_page parameters
 * @typedef {Partial<{ page: number; per_page: number }>} PaginationParameters
 *
 * @typedef {'asc'|'desc'} SortOrder
 */

/**
 * @template K
 * @typedef {Partial<{ sort: K; sort_order: SortOrder }>} SortParameters<K>
 */

/**
 * The request queue, shared by all DiscogsClient instances
 */
let queue = new Queue({
    maxCalls: defaultConfig.requestLimit,
    interval: defaultConfig.requestLimitInterval,
});

export class DiscogsClient {
    /**
     * @param {Partial<{userAgent: string; auth: Partial<Auth>}>} [options]
     */
    constructor(options = {}) {
        // Set the default configuration
        /**
         * @type {ClientConfig}
         * @private
         */
        this.config = Object.assign({}, defaultConfig);

        // Set the custom User Agent when provided
        if (typeof options.userAgent === 'string') {
            this.config.userAgent = options.userAgent;
        }

        /**
         * @type {Partial<Auth> | undefined}
         * @private
         */
        this.auth = undefined;

        // Set auth data when provided
        if (typeof options.auth === 'object') {
            this.auth = {};
            /** @type {Partial<Auth>} */
            let auth = Object.assign({}, options.auth);

            queue.setConfig({ maxCalls: this.config.requestLimitAuth });
            // use 'discogs' as default method
            if (!auth.hasOwnProperty('method')) {
                this.auth.method = 'discogs';
            }

            if (!auth.hasOwnProperty('level')) {
                if (auth.userToken) {
                    this.auth.userToken = auth.userToken;
                    this.auth.level = 2;
                } else if (auth.consumerKey && auth.consumerSecret) {
                    this.auth.consumerKey = this.auth.consumerKey;
                    this.auth.consumerSecret = this.auth.consumerSecret;
                    this.auth.level = 1;
                }
            }
        } else {
            // Unauthenticated new client instances will decrease the shared request limit
            queue.setConfig({ maxCalls: this.config.requestLimit });
        }
    }

    /**
     * Override the default configuration
     * @param {Partial<ClientConfig>} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
     * @returns {DiscogsClient}
     */
    setConfig(customConfig) {
        merge(this.config, customConfig);
        queue.setConfig({
            maxCalls: this.authenticated() ? this.config.requestLimitAuth : this.config.requestLimit,
            interval: this.config.requestLimitInterval,
        });
        return this;
    }

    /**
     * Return whether the client is authenticated for the optionally given access level
     * @param {number} [level] - Optional authentication level
     * @returns {boolean}
     */
    authenticated(level = 0) {
        return typeof this.auth === 'object' && this.auth.level !== undefined && this.auth.level >= level;
    }

    /**
     * Test authentication by getting the identity resource for the authenticated user
     * @typedef {{id: number; username: string; resource_url: string; consumer_name: string}} GetIdentityResponse
     * @returns {Promise<RateLimitedResponse<GetIdentityResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-identity-get
     *
     */
    getIdentity = () => {
        // @ts-ignore
        return this.get({ url: '/oauth/identity', authLevel: 2 });
    };

    /**
     * Get info about the Discogs API and this client
     */
    async about() {
        let clientInfo = {
            version: version,
            userAgent: this.config.userAgent,
            authMethod: this.auth ? this.auth.method : 'none',
            authLevel: this.auth ? this.auth.level : 0,
        };
        let { data, rateLimit } = await this.get('');
        if (data) {
            // @ts-ignore
            return { ...data, rateLimit, disconnect: clientInfo };
        }
        return data;
    }

    /**
     * Send a raw request
     * @param {RequestOptions} options - Request options
     * {
     *		url: '', // May be a relative path when accessing the discogs API
     *		method: '', // Defaults to GET
     *		data: {} // POST/PUT data as an object
     * }
     * @param {RequestCallback} callback - Callback function receiving the data
     * @private
     */
    _rawRequest(options, callback) {
        let data = options.data || null;
        let method = options.method || 'GET';
        let requestURL = new URL(options.url, `https://${this.config.host}`);
        requestURL.port = this.config.port.toString();

        // Build request headers
        let headers = new Headers({
            'User-Agent': this.config.userAgent,
            Accept: `application/vnd.discogs.${this.config.apiVersion}.${this.config.outputFormat}+json`,
        });

        /** @type {import('node-fetch').RequestInit} */
        let requestOptions = {
            method: method,
            headers: headers,
        };

        // Add content headers for POST/PUT requests that contain data
        if (data) {
            if (typeof data === 'object') {
                // Convert data to a JSON string when data is an object/array
                requestOptions.body = JSON.stringify(data);
            }

            // Discogs accepts data in JSON format
            headers.set('Content-Type', 'application/json');
        }

        // Add Authorization header when authenticated (or in the process of authenticating)
        if (this.auth && (this.auth.consumerKey || this.auth.userToken)) {
            let authHeader = '';
            if (this.auth.method === 'oauth') {
                throw new Error('Not implemented!');
                // let fullUrl = requestURL.toString();
                // authHeader = this.oauth().toHeader(method, fullUrl);
            } else if (this.auth.method === 'discogs') {
                authHeader = 'Discogs';
                if (this.auth.userToken) {
                    authHeader += ' token=' + this.auth.userToken;
                } else if (this.auth.consumerKey) {
                    authHeader += ' key=' + this.auth.consumerKey + ', secret=' + this.auth.consumerSecret;
                }
            }
            headers.set('Authorization', authHeader);
        }

        fetch(requestURL.toString(), requestOptions)
            .then(async res => {
                let statusCode = res.status;

                /** @type {RateLimit | undefined} */
                let rateLimit = undefined;
                /** @type {Error | undefined} */
                let err = undefined;

                // Find and add rate limiting when present
                if (res.headers.get('x-discogs-ratelimit')) {
                    rateLimit = {
                        limit: Number(res.headers.get('x-discogs-ratelimit')),
                        used: Number(res.headers.get('x-discogs-ratelimit-used')),
                        remaining: Number(res.headers.get('x-discogs-ratelimit-remaining')),
                    };
                }

                // try parsing JSON response
                /** @type {any} */ // @ts-ignore
                let data = await res.json().catch(() => {});

                if (statusCode > 399) {
                    // Unsuccessful HTTP status? Then pass an error to the callback
                    let errorMessage = (data && data.message) || '';
                    err = new DiscogsError(statusCode, errorMessage);
                }
                callback(err, data, rateLimit);
            })
            .catch(err => {
                callback(err);
            });
    }

    /**
     * Send a request and parse text response to JSON
     * @param {RequestOptions} options - Request options
     * @returns {Promise<{data: unknown; rateLimit?: RateLimit}>}
     */
    async _request(options) {
        // By default, queue requests
        if (!options.hasOwnProperty('queue')) {
            options.queue = true;
        }
        // By default, expect responses to be JSON
        if (!options.hasOwnProperty('json')) {
            options.json = true;
        }

        return new Promise((resolve, reject) => {
            let doRequest = () => {
                this._rawRequest(options, function (err, data, rateLimit) {
                    (err && reject(err)) || resolve({ data, rateLimit });
                });
            };

            // Check whether authentication is required
            if (options.authLevel && !this.authenticated(options.authLevel)) {
                throw new AuthError();
            }

            if (options.queue) {
                // Add API request to the execution queue
                queue.add(err => {
                    if (!err) {
                        doRequest();
                    } else {
                        // Can't add to the queue because it's full
                        throw err;
                    }
                });
            } else {
                // Don't queue, just do the request
                doRequest();
            }
        });
    }

    /**
     * Perform a GET request against the Discogs API
     *
     * @param {string | Pick<RequestOptions, 'url'>} options - Request options object or an url
     */
    get(options) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        return this._request(options);
    }

    /**
     * Perform a POST request against the Discogs API
     * @param {string | RequestOptions} options - Request options object or an url
     * @param {object} data - POST data
     * @returns {Promise<unknown>}
     */
    post(options, data) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        options.method = 'POST';
        options.data = data;
        return this._request(options);
    }

    /**
     * Perform a PUT request against the Discogs API
     * @param {string | RequestOptions} options - Request options object or an url
     * @param {object} data - PUT data
     * @returns {Promise<unknown>}
     */
    put(options, data) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        options.method = 'PUT';
        options.data = data;
        return this._request(options);
    }

    /**
     * Perform a DELETE request against the Discogs API
     * @param {string | RequestOptions} options - Request options object or an url
     * @returns {Promise<unknown>}
     */
    delete(options) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        options.method = 'DELETE';
        return this._request(options);
    }

    /**
     * Get an instance of the Discogs OAuth class
     * @returns {DiscogsOAuth}
     */
    // oauth() {
    //     return new OAuth(this.auth);
    // }

    /**
     * Expose the database functions and pass the current instance
     * @returns {ReturnType<database>}
     */
    database() {
        return database(this);
    }

    /**
     * Expose the marketplace functions and pass the current instance
     * @returns {ReturnType<marketplace>}
     */
    marketplace() {
        return marketplace(this);
    }

    /**
     * Expose the user functions and pass the current instance
     * @returns {ReturnType<user>}
     */
    user() {
        return user(this);
    }
}
