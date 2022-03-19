import fetch from 'node-fetch';
import * as crypto from 'crypto';
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

export default class DiscogsOAuth {
    private consumerKey: string;
    private consumerSecret: string;

    /**
     * @param {string} consumerKey - The Discogs consumer key
     * @param {string} consumerSecret - The Discogs consumer secret
     */
    constructor(consumerKey: string, consumerSecret: string) {
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
    }

    /**
     * Get an OAuth request token from Discogs
     */
    async getRequestToken(callbackUrl: string) {
        let consumerKey = this.consumerKey;
        let consumerSecret = this.consumerSecret;

        let timestamp = Date.now();
        let nonce = crypto.randomBytes(64).toString('hex');

        let resp = await fetch('https://api.discogs.com/oauth/request_token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `OAuth oauth_consumer_key="${consumerKey}", oauth_nonce="${nonce}", oauth_signature="${consumerSecret}&", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_callback="${encodeURIComponent(
                    callbackUrl
                )}"`,
                'User-Agent': 'TODO',
            },
        });

        if (resp.status !== 200) throw new Error('TODO');
        let responseBody = await resp.text();
        let searchParams = new URLSearchParams(responseBody);
        let token = searchParams.get('oauth_token');
        return {
            token: token,
            tokenSecret: searchParams.get('oauth_token_secret'),
            callbackConfirmed: searchParams.get('oauth_callback_confirmed'),
            authorizeUrl: `https://discogs.com/oauth/authorize?oauth_token=${token}`,
        };
    }

    /**
     * Get an OAuth access token from Discogs
     * @param {string} token
     * @param {string} tokenSecret
     * @param {string} verifier - The OAuth 1.0a verification code returned by Discogs
     */
    async getAccessToken(token: string, tokenSecret: string, verifier: string) {
        let consumerKey = this.consumerKey;
        let consumerSecret = this.consumerSecret;

        let timestamp = Date.now();
        let nonce = crypto.randomBytes(64).toString('hex');

        let resp = await fetch('https://api.discogs.com/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `OAuth oauth_consumer_key="${consumerKey}", oauth_nonce="${nonce}", oauth_token="${token}", oauth_signature="${consumerSecret}&${tokenSecret}", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_verifier="${verifier}"`,
                'User-Agent': 'TODO',
            },
        });

        if (resp.status !== 200) throw new Error('TODO');
        let responseBody = await resp.text();
        let searchParams = new URLSearchParams(responseBody);
        return {
            token: searchParams.get('oauth_token'),
            tokenSecret: searchParams.get('oauth_token_secret'),
        };
    }
}

(async () => {
    // let test = new DiscogsOAuth();
    // let rt = await test.getRequestToken(
    //     'aaa',
    //     'bbb',
    //     'http://localhost:3000'
    // );
    // console.log({ rt });

    // let at = await test.getAccessToken(
    //     'aaa',
    //     'bbb',
    //     'ccc',
    //     'ddd',
    //     'eee'
    // );
    // console.log({ at });

    // let token = 'aa';
    // let secret = 'bb';
    // let client = new DiscogsClient({ auth: { method: 'oauth', token: token, tokenSecret: secret } });
    // let resp = await client.getIdentity();
})();
