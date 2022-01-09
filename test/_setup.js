import test from 'ava';
import { setupServer } from 'msw/node/lib/index.js';

export function setupMockAPI() {
    const server = setupServer();

    // Enable API mocking before tests.
    test.before(() => server.listen());

    // Reset any runtime request handlers we may add during the tests.
    test.afterEach.always(() => server.resetHandlers());

    // Disable API mocking after the tests are done.
    test.after(() => server.close());

    return server;
}
