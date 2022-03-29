import fetch from 'node-fetch';
import * as crypto from 'crypto';
import { DiscogsError } from './error.js';

// TODO: user agent should be configurable, use the one that is passed to the discogs client
const version = process.env.VERSION_NUMBER || 'dev';
const homepage = 'https://github.com/lionralfs/discogs-client';
const userAgent = `@lionralfs/discogs-client/${version} +${homepage}`;

/**
 * @see https://www.discogs.com/developers/#page:authentication,header:authentication-oauth-flow
 */
export class DiscogsOAuth {
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
                'User-Agent': userAgent,
            },
        });

        if (resp.status !== 200) {
            let message = 'Unknown Error.';
            try {
                message = await resp.text();
            } catch (_) {}
            throw new DiscogsError(resp.status, message);
        }
        let responseBody = await resp.text();
        let searchParams = new URLSearchParams(responseBody);
        let token = searchParams.get('oauth_token');
        return {
            token: token,
            tokenSecret: searchParams.get('oauth_token_secret'),
            callbackConfirmed: searchParams.get('oauth_callback_confirmed') === 'true',
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
                'User-Agent': userAgent,
            },
        });

        if (resp.status !== 200) {
            let message = 'Unknown Error.';
            try {
                message = await resp.text();
            } catch (_) {}
            throw new DiscogsError(resp.status, message);
        }
        let responseBody = await resp.text();
        let searchParams = new URLSearchParams(responseBody);
        return {
            accessToken: searchParams.get('oauth_token'),
            accessTokenSecret: searchParams.get('oauth_token_secret'),
        };
    }
}

export function toAuthHeader(
    consumerKey: string,
    consumerSecret: string,
    accessToken: string,
    accessTokenSecret: string
) {
    let nonce = crypto.randomBytes(64).toString('hex');
    let timestamp = Date.now();
    return `OAuth oauth_consumer_key="${consumerKey}", oauth_token="${accessToken}", oauth_signature_method="PLAINTEXT", oauth_signature="${consumerSecret}&${accessTokenSecret}", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_token_secret="${accessTokenSecret}", oauth_version="1.0"`;
}
