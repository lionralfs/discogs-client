import fetch from 'node-fetch';
import crypto from 'crypto';
import { parse } from 'querystring';
import { merge } from './util.js';
import { DiscogsClient } from './client.js';

/**
 * Default configuration
 */
let defaultConfig = {
    requestTokenUrl: 'https://api.discogs.com/oauth/request_token',
    accessTokenUrl: 'https://api.discogs.com/oauth/access_token',
    authorizeUrl: 'https://www.discogs.com/oauth/authorize',
    version: '1.0',
    signatureMethod: 'PLAINTEXT', // Or HMAC-SHA1
};

/**
 * Object constructor
 * @param {object} [auth] - Authentication object
 * @returns {DiscogsOAuth}
 */
export default class DiscogsOAuth {
    constructor(auth) {
        this.config = merge({}, defaultConfig);
        this.auth = { method: 'oauth', level: 0 };
        if (auth && typeof auth === 'object' && auth.method === 'oauth') {
            merge(this.auth, auth);
        }
    }
    /**
     * Override the default configuration
     * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
     * @returns {DiscogsOAuth}
     */
    setConfig(customConfig) {
        merge(this.config, customConfig);
        return this;
    }
    /**
     * Get an OAuth request token from Discogs
     * @param {string} consumerKey - The Discogs consumer key
     * @param {string} consumerSecret - The Discogs consumer secret
     * @param {function} [callbackUrl] - Callback function receiving the data
     */
    getRequestToken(consumerKey: string, consumerSecret: string, callbackUrl: string) {
        let auth = this.auth;
        let config = this.config;

        auth.consumerKey = consumerKey;
        auth.consumerSecret = consumerSecret;

        let timestamp = Date.now();
        let nonce = crypto.randomBytes(64).toString('hex');

        return fetch('https://api.discogs.com/oauth/request_token', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `OAuth oauth_consumer_key="${consumerKey}", oauth_nonce="${nonce}", oauth_signature="${consumerSecret}&", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_callback="your_callback"`,
            },
        }).then(res => res.json());
        return new DiscogsClient(auth)
            .get({
                url: config.requestTokenUrl + '?oauth_callback=' + encodeURIComponent(callbackUrl),
                queue: false,
                json: false,
            })
            .then(response => {
                console.log(response);
            })
            .catch(console.error);
        // function (err, data) {
        //     if (!err && data) {
        //         data = parse(data);
        //         auth.token = data.oauth_token;
        //         auth.tokenSecret = data.oauth_token_secret;
        //         auth.authorizeUrl = config.authorizeUrl + '?oauth_token=' + data.oauth_token;
        //     }
        //     if (typeof callback === 'function') {
        //         callback(err, auth);
        //     }
        // }
    }
    /**
     * Get an OAuth access token from Discogs
     * @param {string} verifier - The OAuth 1.0a verification code returned by Discogs
     * @param {function} [callback] - Callback function receiving the data
     * @returns {DiscogsOAuth}
     */
    getAccessToken(verifier, callback) {
        let auth = this.auth;
        new Client(auth).get(
            {
                url: this.config.accessTokenUrl + '?oauth_verifier=' + prototype.percentEncode(verifier),
                queue: false,
                json: false,
            },
            function (err, data) {
                if (!err && data) {
                    data = parse(data);
                    auth.token = data.oauth_token;
                    auth.tokenSecret = data.oauth_token_secret;
                    auth.level = 2;
                    delete auth.authorizeUrl;
                }
                if (typeof callback === 'function') {
                    callback(err, auth);
                }
            }
        );
        return this;
    }
    /**
     * Generic function to return the auth object
     * @returns {object}
     */
    export() {
        return this.auth;
    }
    /**
     * Parse the OAuth HTTP header content
     * @param {string} requestMethod - The upper case HTTP request method (GET, POST, etc)
     * @param {string} url - The url that is to be accessed
     * @returns {string}
     */
    toHeader(requestMethod, url) {
        let oAuth = new OAuth({
                consumer: { key: this.auth.consumerKey, secret: this.auth.consumerSecret },
                signature_method: this.config.signatureMethod,
                version: this.config.version,
            }),
            authObj = oAuth.authorize(
                { method: requestMethod, url: url },
                { key: this.auth.token, secret: this.auth.tokenSecret }
            );
        return oAuth.toHeader(authObj).Authorization;
    }
}
