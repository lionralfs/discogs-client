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
 * Default configuration
 */
let defaultConfig = {
    host: 'api.discogs.com',
    port: 443,
    userAgent: 'DisConnectClient/' + version + ' +' + homepage,
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

/**
 * Object constructor
 * @param {string} [userAgent] - The name of the user agent to use to make API calls
 * @param {object} [auth] - Optional authorization data object
 * @returns {DiscogsClient}
 */
export class DiscogsClient {
    constructor(userAgent, auth) {
        // Allow the class to be called as a function, returning an instance
        if (!(this instanceof DiscogsClient)) {
            return new DiscogsClient(userAgent, auth);
        }
        // Set the default configuration
        this.config = merge({}, defaultConfig);
        // Set the custom User Agent when provided
        if (typeof userAgent === 'string') {
            this.config.userAgent = userAgent;
        }
        // No userAgent provided, but instead we have an accessObject
        if (arguments.length === 1 && typeof userAgent === 'object') {
            auth = userAgent;
        }
        // Set auth data when provided
        if (auth && typeof auth === 'object') {
            queue.setConfig({ maxCalls: this.config.requestLimitAuth });
            if (!auth.hasOwnProperty('method')) {
                auth.method = 'discogs';
            }
            if (!auth.hasOwnProperty('level')) {
                if (auth.userToken) {
                    auth.level = 2;
                } else if (auth.consumerKey && auth.consumerSecret) {
                    auth.level = 1;
                }
            }
            this.auth = merge({}, auth);
            // Unauthenticated new client instances will decrease the shared request limit
        } else {
            queue.setConfig({ maxCalls: this.config.requestLimit });
        }
    }
    /**
     * Override the default configuration
     * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
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
        return !(typeof this.auth === 'undefined') && this.auth.level > 0 && this.auth.level >= level;
    }
    /**
     * Test authentication by getting the identity resource for the authenticated user
     * @returns {Promise<unknown>}
     */
    getIdentity = () => {
        return this.get({ url: '/oauth/identity', authLevel: 2 });
    };
    /**
     * Get info about the Discogs API and this client
     */
    about() {
        let clientInfo = {
            version: version,
            userAgent: this.config.userAgent,
            authMethod: this.auth ? this.auth.method : 'none',
            authLevel: this.auth ? this.auth.level : 0,
        };
        return this.get('').then(function (data) {
            data && (data.disconnect = clientInfo);
            return data;
        });
    }
    /**
     * Send a raw request
     * @param {{url: string, method: 'GET'|'POST'|'PUT'|'DELETE', data: Record<string, any>}} options - Request options
     * {
     *		url: '', // May be a relative path when accessing the discogs API
     *		method: '', // Defaults to GET
     *		data: {} // POST/PUT data as an object
     * }
     * @param {CallbackFn} callback - Callback function receiving the data
     * @returns {DiscogsClient}
     */
    _rawRequest(options, callback) {
        let data = options.data || null;
        let method = options.method || 'GET';
        let urlParts = new URL(options.url, `https://${this.config.host}`);
        urlParts.port = this.config.port;
        let encoding = options.encoding || 'utf8';

        // Build request headers
        let headers = {
            'User-Agent': this.config.userAgent,
            Accept:
                'application/vnd.discogs.' +
                this.config.apiVersion +
                '.' +
                this.config.outputFormat +
                '+json,application/octet-stream',
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
                let data = '',
                    rateLimit = null,
                    add = function (chunk) {
                        data += chunk.toString();
                    };

                // Pass the data to the callback and pass an error on unsuccessful HTTP status
                let passData = function () {
                    let err = null,
                        status = parseInt(res.statusCode, 10);
                    if (status > 399) {
                        // Unsuccessful HTTP status? Then pass an error to the callback
                        let match = data.match(/^\{"message": "(.+)"\}/i);
                        err = new DiscogsError(status, match && match[1] ? match[1] : null);
                    }
                    callback(err, data, rateLimit);
                };

                // Find and add rate limiting when present
                if (res.headers['x-discogs-ratelimit']) {
                    rateLimit = {
                        limit: parseInt(res.headers['x-discogs-ratelimit'], 10),
                        used: parseInt(res.headers['x-discogs-ratelimit-used'], 10),
                        remaining: parseInt(res.headers['x-discogs-ratelimit-remaining'], 10),
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
        return this;
    }
    /**
     * Send a request and parse text response to JSON
     * @param {object} options - Request options
     * {
     *		url: '', // May be a relative path when accessing the Discogs API
     *		method: '', // Defaults to GET
     *		data: {} // POST/PUT data as an object
     * }
     * @returns {Promise<unknown>}
     */
    _request(options) {
        return new Promise((resolve, reject) => {
            let client = this;

            function callback(err, data) {
                (err && reject(err)) || resolve(data);
            }

            function doRequest() {
                client._rawRequest(options, function (err, data, rateLimit) {
                    if (data && options.json && data.indexOf('<!') !== 0) {
                        data = JSON.parse(data);
                    }
                    callback(err, data, rateLimit);
                });
            }

            function prepareRequest() {
                // Check whether authentication is required
                if (!options.authLevel || client.authenticated(options.authLevel)) {
                    if (options.queue) {
                        // Add API request to the execution queue
                        queue.add(function (err) {
                            if (!err) {
                                doRequest(callback);
                            } else {
                                // Can't add to the queue because it's full
                                callback(err);
                            }
                        });
                    } else {
                        // Don't queue, just do the request
                        doRequest(callback);
                    }
                } else {
                    callback(new AuthError());
                }
            }

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
     * @param {(object|string)} options - Request options object or an url
     * @returns {Promise<unknown>}
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
