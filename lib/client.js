// @ts-check
// @ts-ignore
import https from 'https';
import { createGunzip, createInflate } from 'zlib';
import { DiscogsError, AuthError } from './error.js';
import { merge } from './util.js';
import Queue from './queue.js';
import OAuth from 'oauth-1.0a';
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
 * @typedef {{method: 'discogs'; level: number; consumerKey: string; consumerSecret: string; userToken: string}} Auth
 * @typedef {{limit: number; used: number; remaining: number}} RateLimit
 * @typedef {(err?: Error, data?: unknown, rateLimit?: RateLimit) => any} RequestCallback
 * @typedef {{url: string, method: 'GET'|'POST'|'PUT'|'DELETE', data: Record<string, any>, queue: boolean, json: boolean; authLevel: number }} RequestOptions
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
     * @param {Partial<{userAgent: string; auth: Partial<Auth>}>} options

     * @returns
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
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-identity-get
     *
     * @returns {Promise<RateLimitedResponse<GetIdentityResponse>>}
     */
    getIdentity = () => {
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
     * @param {{url: string, method: 'GET'|'POST'|'PUT'|'DELETE', data: Record<string, any>}} options - Request options
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
        let urlParts = new URL(options.url, `https://${this.config.host}`);
        urlParts.port = this.config.port.toString();
        let encoding = options.encoding || 'utf8';

        // Build request headers
        let headers = {
            'User-Agent': this.config.userAgent,
            Accept: `application/vnd.discogs.${this.config.apiVersion}.${this.config.outputFormat}+json`,
            'Accept-Encoding': 'gzip,deflate',
            Host: urlParts.host,
            Connection: 'close',
            'Content-Length': 0,
        };

        // Add content headers for POST/PUT requests that contain data
        if (data) {
            if (typeof data === 'object') {
                data = JSON.stringify(data);
            } // Convert data to a JSON string when data is an object/array
            headers['Content-Type'] = 'application/json'; // Discogs accepts data in JSON format
            headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }

        // Add Authorization header when authenticated (or in the process of authenticating)
        if (this.auth && (this.auth.consumerKey || this.auth.userToken)) {
            let authHeader = '';
            if (this.auth.method === 'oauth') {
                let fullUrl = urlParts.toString();
                authHeader = this.oauth().toHeader(method, fullUrl);
            } else if (this.auth.method === 'discogs') {
                authHeader = 'Discogs';
                if (this.auth.userToken) {
                    authHeader += ' token=' + this.auth.userToken;
                } else if (this.auth.consumerKey) {
                    authHeader += ' key=' + this.auth.consumerKey + ', secret=' + this.auth.consumerSecret;
                }
            }
            headers['Authorization'] = authHeader;
        }

        let searchParams = urlParts.searchParams.toString();
        // Set the HTTPS request options
        let requestOptions = {
            hostname: urlParts.hostname,
            port: urlParts.port,
            path: `${urlParts.pathname}${searchParams ? `?${searchParams}` : ''}`,
            method: method,
            headers: headers,
        };

        // Build the HTTPS request
        let req = https
            .request(requestOptions, function (res) {
                let data = '';
                /** @type {RateLimit | undefined} */
                let rateLimit = undefined;
                let add = function (/** @type {any} */ chunk) {
                    data += chunk.toString();
                };

                // Pass the data to the callback and pass an error on unsuccessful HTTP status
                let passData = function () {
                    /** @type {Error | undefined} */
                    let err = undefined;
                    let status = Number(res.statusCode);
                    if (status > 399) {
                        // Unsuccessful HTTP status? Then pass an error to the callback
                        let match = data.match(/^\{"message": "(.+)"\}/i);
                        err = new DiscogsError(status, match && match[1] ? match[1] : undefined);
                    }
                    callback(err, data, rateLimit);
                };

                // Find and add rate limiting when present
                if (res.headers['x-discogs-ratelimit']) {
                    rateLimit = {
                        limit: Number(res.headers['x-discogs-ratelimit']),
                        used: Number(res.headers['x-discogs-ratelimit-used']),
                        remaining: Number(res.headers['x-discogs-ratelimit-remaining']),
                    };
                }

                // Get the response content and pass it to the callback
                switch (res.headers['content-encoding']) {
                    case 'gzip':
                        let gunzip = createGunzip().on('data', add).on('end', passData);
                        res.pipe(gunzip);
                        break;
                    case 'deflate':
                        let inflate = createInflate().on('data', add).on('end', passData);
                        res.pipe(inflate);
                        break;
                    default:
                        // Set encoding when provided
                        res.setEncoding(encoding);
                        res.on('data', add).on('end', passData);
                }
            })
            .on('error', function (err) {
                callback(err);
            });

        // When present, write the data to the request
        if (data) {
            req.write(data);
        }

        req.end();
    }
    /**
     * Send a request and parse text response to JSON
     * @param {RequestOptions} options - Request options
     * @returns {Promise<{data: unknown; rateLimit: RateLimit}>}
     */
    _request(options) {
        return new Promise((resolve, reject) => {
            /**
             * @param {Error} [err]
             * @param {unknown} [data]
             * @param {RateLimit} [rateLimit]
             */
            function callback(err, data, rateLimit) {
                (err && reject(err)) || resolve({ data, rateLimit });
            }

            let doRequest = () => {
                this._rawRequest(options, function (err, data, rateLimit) {
                    if (data && options.json && data.indexOf('<!') !== 0) {
                        data = JSON.parse(data);
                    }
                    callback(err, data, rateLimit);
                });
            };

            let prepareRequest = () => {
                // Check whether authentication is required
                if (!options.authLevel || this.authenticated(options.authLevel)) {
                    if (options.queue) {
                        // Add API request to the execution queue
                        queue.add(function (err) {
                            if (!err) {
                                doRequest();
                            } else {
                                // Can't add to the queue because it's full
                                callback(err);
                            }
                        });
                    } else {
                        // Don't queue, just do the request
                        doRequest();
                    }
                } else {
                    callback(new AuthError());
                }
            };

            // By default, queue requests
            if (!options.hasOwnProperty('queue')) {
                options.queue = true;
            }
            // By default, expect responses to be JSON
            if (!options.hasOwnProperty('json')) {
                options.json = true;
            }

            prepareRequest();
        });
    }
    /**
     * Perform a GET request against the Discogs API
     *
     * @param {string | Partial<RequestOptions>} options - Request options object or an url
     */
    get(options) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        return this._request(options);
    }
    /**
     * Perform a POST request against the Discogs API
     * @param {(object|string)} options - Request options object or an url
     * @param {object} data - POST data
     * @returns {Promise<unknown>}
     */
    post(options, data) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        return this._request(merge(options, { method: 'POST', data: data }));
    }
    /**
     * Perform a PUT request against the Discogs API
     * @param {(object|string)} options - Request options object or an url
     * @param {object} data - PUT data
     * @returns {Promise<unknown>}
     */
    put(options, data) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        return this._request(merge(options, { method: 'PUT', data: data }));
    }
    /**
     * Perform a DELETE request against the Discogs API
     * @param {(object|string)} options - Request options object or an url
     * @returns {Promise<unknown>}
     */
    delete(options) {
        if (typeof options === 'string') {
            options = { url: options };
        }
        return this._request(merge(options, { method: 'DELETE' }));
    }
    /**
     * Get an instance of the Discogs OAuth class
     * @returns {DiscogsOAuth}
     */
    oauth() {
        return new OAuth(this.auth);
    }
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
