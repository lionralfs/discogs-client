import test from 'ava';
import { toAuthHeader } from '@lib/oauth.js';
import type * as crypto from 'crypto';

const fakeCrypto: typeof crypto = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    randomBytes(size: number) {
        return {
            toString(encoding: string, start: number, end: number) {
                if (size === 32 && encoding === 'hex' && start === 0 && end === 64) {
                    return 'correct';
                } else {
                    return 'incorrect';
                }
            },
        };
    },
};

test('OAuth: toAuthHeader', t => {
    t.regex(
        toAuthHeader(
            'consumer_key',
            'consumer_secret',
            'access_token',
            'access_token_secret',
            { now: () => 12345 },
            fakeCrypto
        ),
        /^OAuth oauth_consumer_key="consumer_key", oauth_token="access_token", oauth_signature_method="PLAINTEXT", oauth_signature="consumer_secret&access_token_secret", oauth_timestamp="12", oauth_nonce="correct", oauth_token_secret="access_token_secret", oauth_version="1.0"$/
    );
});
