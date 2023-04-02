import test from 'ava';
import { toAuthHeader } from '@lib/oauth.js';

test('OAuth: toAuthHeader', t => {
    t.regex(
        toAuthHeader('consumer_key', 'consumer_secret', 'access_token', 'access_token_secret'),
        /^OAuth oauth_consumer_key="consumer_key", oauth_token="access_token", oauth_signature_method="PLAINTEXT", oauth_signature="consumer_secret&access_token_secret", oauth_timestamp="\d+", oauth_nonce=".+", oauth_token_secret="access_token_secret", oauth_version="1.0"$/
    );
});
