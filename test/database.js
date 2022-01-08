import { async, assert, test as _test } from 'wru';
import nock, { cleanAll } from 'nock';
import DiscogsClient from '../lib/client.js';

var tests = (module.exports = [
    {
        name: 'Database: Test search without query but with params',
        test: function () {
            nock('https://api.discogs.com')
                .get('/database/search?artist=X&title=Y')
                .reply(200, '{"result": "success"}');

            var client = new DiscogsClient('agent', { consumerKey: 'u', consumerSecret: 'p' });
            var db = client.database();
            db.search(
                { artist: 'X', title: 'Y' },
                async(function (err, data) {
                    assert('No error', !err);
                    assert('Correct response data', data && data.result === 'success');
                })
            );
        },
        teardown: function () {
            cleanAll();
        },
    },
    {
        name: 'Database: Test search with query and params',
        test: function () {
            nock('https://api.discogs.com')
                .get('/database/search?artist=X&title=Y&q=somequery')
                .reply(200, '{"result": "success"}');

            var client = new DiscogsClient('agent', { consumerKey: 'u', consumerSecret: 'p' });
            var db = client.database();
            db.search(
                'somequery',
                { artist: 'X', title: 'Y' },
                async(function (err, data) {
                    assert('No error', !err);
                    assert('Correct response data', data && data.result === 'success');
                })
            );
        },
        teardown: function () {
            cleanAll();
        },
    },
    {
        name: 'Database: Test search with query only',
        test: function () {
            nock('https://api.discogs.com').get('/database/search?q=somequery').reply(200, '{"result": "success"}');

            var client = new DiscogsClient('agent', { consumerKey: 'u', consumerSecret: 'p' });
            var db = client.database();
            db.search(
                'somequery',
                async(function (err, data) {
                    assert('No error', !err);
                    assert('Correct response data', data && data.result === 'success');
                })
            );
        },
        teardown: function () {
            cleanAll();
        },
    },
]);

if (!module.parent) {
    _test(tests);
}
