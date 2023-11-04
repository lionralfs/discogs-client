import { beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node';

export function setupMockAPI() {
    const server = setupServer();

    // Enable API mocking before tests.
    beforeAll(() => server.listen());

    // Reset any runtime request handlers we may add during the tests.
    afterEach(() => server.resetHandlers());

    // Disable API mocking after the tests are done.
    afterAll(() => server.close());

    return server;
}