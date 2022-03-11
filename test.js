import fetch from 'node-fetch';
import { randomBytes } from 'crypto';

async function getRequestToken(consumerKey, consumerSecret) {
    let timestamp = Date.now();
    let nonce = randomBytes(64).toString('hex');

    const resp = await fetch('https://api.discogs.com/oauth/request_token', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `OAuth oauth_consumer_key="${consumerKey}", oauth_nonce="${nonce}", oauth_signature="${consumerSecret}&", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_callback="your_callback"`,
        },
    });
    return await resp.text();
}

getRequestToken('aaa', 'bbb').then(console.log);
