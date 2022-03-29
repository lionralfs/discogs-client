import fetch, { Headers, RequestInit } from 'node-fetch';
import { DiscogsError, AuthError } from './error.js';
import { merge } from './util.js';
import database from './database.js';
import marketplace from './marketplace.js';
import user from './user.js';
import {
    type Auth,
    type GetIdentityResponse,
    type RateLimit,
    type RateLimitedResponse,
    type RequestCallback,
    type RequestOptions,
    type ClientConfig,
} from './types.js';
import { toAuthHeader } from './oauth.js';

const version = process.env.VERSION_NUMBER || 'dev';
const homepage = 'https://github.com/lionralfs/discogs-client';
const userAgent = `@lionralfs/discogs-client/${version} +${homepage}`;

/**
 * Default configuration
 */
let defaultConfig: ClientConfig = {
    host: 'api.discogs.com',
    port: 443,
    userAgent: userAgent,
    apiVersion: 'v2',
    // Possible values: 'discogs' / 'plaintext' / 'html'
    outputFormat: 'discogs',
};
export class DiscogsClient {
    private config: ClientConfig;
    private auth: Partial<Auth> | undefined;

    /**
     * @param {Partial<{userAgent: string; auth: Partial<Auth>}>} [options]
     */
    constructor(options: Partial<{ userAgent: string; auth: Partial<Auth> }> = {}) {
        // Set the default configuration
        this.config = Object.assign({}, defaultConfig);

        // Set the custom User Agent when provided
        if (typeof options.userAgent === 'string') {
            this.config.userAgent = options.userAgent;
        }

        this.auth = undefined;

        // Set auth data when provided
        if (typeof options.auth === 'object') {
            this.auth = {};
            let auth: Partial<Auth> = Object.assign({}, options.auth);

            // use 'discogs' as default method
            if (!auth.hasOwnProperty('method')) {
                this.auth.method = 'discogs';
            } else {
                this.auth.method = auth.method;
            }

            if (!auth.hasOwnProperty('level')) {
                if (auth.userToken) {
                    // Personal access token
                    this.auth.userToken = auth.userToken;
                    this.auth.level = 2;
                } else if (auth.consumerKey && auth.consumerSecret) {
                    this.auth.consumerKey = auth.consumerKey;
                    this.auth.consumerSecret = auth.consumerSecret;

                    if (auth.accessToken && auth.accessTokenSecret) {
                        // Full OAuth 1.0a with access token/secret
                        this.auth.accessToken = auth.accessToken;
                        this.auth.accessTokenSecret = auth.accessTokenSecret;
                        this.auth.level = 2;
                    } else {
                        // Only Consumer key/secret
                        this.auth.level = 1;
                    }
                }
            }
        }
    }

    /**
     * Override the default configuration
     * @param {Partial<ClientConfig>} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
     * @returns {DiscogsClient}
     */
    setConfig(customConfig: Partial<ClientConfig>): DiscogsClient {
        merge(this.config, customConfig);
        return this;
    }

    /**
     * Return whether the client is authenticated for the optionally given access level
     * @param {number} [level] - Optional authentication level
     * @returns {boolean}
     */
    authenticated(level: number = 0): boolean {
        return typeof this.auth === 'object' && this.auth.level !== undefined && this.auth.level >= level;
    }

    /**
     * Test authentication by getting the identity resource for the authenticated user
     * @returns {Promise<RateLimitedResponse<GetIdentityResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-identity-get
     *
     * @example
     * await client.user().getIdentity();
     */
    getIdentity = (): Promise<RateLimitedResponse<GetIdentityResponse>> => {
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
    _rawRequest(options: RequestOptions, callback: RequestCallback) {
        let data = options.data || null;
        let method = options.method || 'GET';
        let requestURL = new URL(options.url, `https://${this.config.host}`);
        requestURL.port = this.config.port.toString();

        // Build request headers
        let headers = new Headers({
            'User-Agent': this.config.userAgent,
            Accept: `application/vnd.discogs.${this.config.apiVersion}.${this.config.outputFormat}+json`,
        });

        let requestOptions: RequestInit = {
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
                // doing the full oauth requires all four:
                // - consumer key
                // - consumer secret
                // - access token
                // - access token secret

                authHeader = toAuthHeader(
                    this.auth.consumerKey!,
                    this.auth.consumerSecret!,
                    this.auth.accessToken!,
                    this.auth.accessTokenSecret!
                );
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
                let rateLimit: RateLimit | undefined = undefined;
                /** @type {Error | undefined} */
                let err: Error | undefined = undefined;

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
                let data: any = await res.json().catch(() => {});

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
    async _request(options: RequestOptions): Promise<{ data: unknown; rateLimit?: RateLimit }> {
        // By default, expect responses to be JSON
        if (!options.hasOwnProperty('json')) {
            options.json = true;
        }

        return new Promise((resolve, reject) => {
            let doRequest = () => {
                this._rawRequest(options, function (err, data, rateLimit) {
                    if (err) return reject(err);
                    resolve({ data, rateLimit });
                });
            };

            // Check whether authentication is required
            if (options.authLevel && !this.authenticated(options.authLevel)) {
                throw new AuthError();
            }

            doRequest();
        });
    }

    /**
     * Perform a GET request against the Discogs API
     *
     * @param {string | RequestOptions} options - Request options object or an url
     */
    get(options: string | RequestOptions) {
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
    post(options: string | RequestOptions, data: RequestOptions['data']): Promise<unknown> {
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
    put(options: string | RequestOptions, data: object): Promise<unknown> {
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
    delete(options: string | RequestOptions): Promise<unknown> {
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
     * @returns {ReturnType<typeof database>}
     */
    database(): ReturnType<typeof database> {
        return database(this);
    }

    /**
     * Expose the marketplace functions and pass the current instance
     * @returns {ReturnType<marketplace>}
     */
    marketplace(): ReturnType<typeof marketplace> {
        return marketplace(this);
    }

    /**
     * Expose the user functions and pass the current instance
     * @returns {ReturnType<typeof user>}
     */
    user(): ReturnType<typeof user> {
        return user(this);
    }
}
