export function randomBytes(_) {
    return {
        toString(_) {
            // not quite the same but it's only used for nonce generation
            return window.crypto.randomUUID();
        },
    };
}
