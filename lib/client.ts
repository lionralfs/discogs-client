import fetch, { Headers, RequestInit } from 'node-fetch';
import { DiscogsError, AuthError } from './error.js';
import { hasProperty, merge } from './util.js';
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
const defaultConfig: ClientConfig = {
    host: 'api.discogs.com',
    port: 443,
    userAgent: userAgent,
    apiVersion: 'v2',
    // Possible values: 'discogs' / 'plaintext' / 'html'
    outputFormat: 'discogs',
    exponentialBackoffMaxRetries: 0,
    exponentialBackoffIntervalMs: 2000,
    exponentialBackoffRate: 2.7,
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
            const auth: Partial<Auth> = Object.assign({}, options.auth);

            // use 'discogs' as default method
            if (!Object.prototype.hasOwnProperty.call(auth, 'method')) {
                this.auth.method = 'discogs';
            } else {
                this.auth.method = auth.method;
            }

            if (!Object.prototype.hasOwnProperty.call(auth, 'level')) {
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
     * @param {Partial<ClientConfig>} customConfig - Custom configuration object
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
    authenticated(level = 0): boolean {
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
        return this.get({ url: '/oauth/identity', authLevel: 2 }) as Promise<RateLimitedResponse<GetIdentityResponse>>;
    };

    /**
     * Get info about the Discogs API and this client
     */
    async about() {
        const clientInfo = {
            version: version,
            userAgent: this.config.userAgent,
            authMethod: this.auth ? this.auth.method : 'none',
            authLevel: this.auth ? this.auth.level : 0,
        };
        const { data, rateLimit } = await this.get('');
        if (data) {
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
     * @param {number} failedAttempts The amounts of times this request has been attempted but failed
     */
    private rawRequest(options: RequestOptions, callback: RequestCallback, failedAttempts = 0) {
        const data = options.data || null;
        const method = options.method || 'GET';
        const requestURL = new URL(options.url, `https://${this.config.host}`);
        requestURL.port = this.config.port.toString();

        // Build request headers
        const headers = new Headers({
            'User-Agent': this.config.userAgent,
            Accept: `application/vnd.discogs.${this.config.apiVersion}.${this.config.outputFormat}+json`,
        });

        const requestOptions: RequestInit = {
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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.auth.consumerKey!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.auth.consumerSecret!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.auth.accessToken!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
                const statusCode = res.status;

                if (statusCode === 429) {
                    if (failedAttempts < this.config.exponentialBackoffMaxRetries) {
                        const waitMs =
                            this.config.exponentialBackoffIntervalMs *
                            Math.pow(this.config.exponentialBackoffRate, failedAttempts);
                        setTimeout(() => {
                            this.rawRequest(options, callback, failedAttempts + 1);
                        }, waitMs);
                        return;
                    }
                }

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
                const data: unknown = await res.json().catch(
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    () => {}
                );

                if (statusCode > 399) {
                    // Unsuccessful HTTP status? Then pass an error to the callback
                    const message =
                        hasProperty(data, 'message') && typeof data.message === 'string' ? data.message : '';
                    err = new DiscogsError(statusCode, message);
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
    async request(options: RequestOptions): Promise<{ data: unknown; rateLimit?: RateLimit }> {
        // By default, expect responses to be JSON
        if (!Object.prototype.hasOwnProperty.call(options, 'json')) {
            options.json = true;
        }

        return new Promise((resolve, reject) => {
            const doRequest = () => {
                this.rawRequest(options, function (err, data, rateLimit) {
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
        return this.request(options);
    }

    /**
     * Perform a POST request against the Discogs API
     * @param {string | RequestOptions} options - Request options object or an url
     * @param {RequestOptions['data']} data - POST data
     * @returns {Promise<unknown>}
     */
    post(options: string | RequestOptions, data: RequestOptions['data']): Promise<unknown> {
        if (typeof options === 'string') {
            options = { url: options };
        }
        options.method = 'POST';
        options.data = data;
        return this.request(options);
    }

    /**
     * Perform a PUT request against the Discogs API
     * @param {string | RequestOptions} options - Request options object or an url
     * @param {RequestOptions['data']} data - PUT data
     * @returns {Promise<unknown>}
     */
    put(options: string | RequestOptions, data: RequestOptions['data']): Promise<unknown> {
        if (typeof options === 'string') {
            options = { url: options };
        }
        options.method = 'PUT';
        options.data = data;
        return this.request(options);
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
        return this.request(options);
    }

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
