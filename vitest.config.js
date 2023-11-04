import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
        },
    },
    resolve: {
        alias: {
            '@lib': path.resolve(__dirname, './lib'),
        },
    },
});
