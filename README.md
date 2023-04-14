[![npm](https://img.shields.io/npm/v/@lionralfs/discogs-client)](https://www.npmjs.com/package/@lionralfs/discogs-client)
![npm type definitions](https://img.shields.io/npm/types/@lionralfs/discogs-client)
![node-current](https://img.shields.io/node/v/@lionralfs/discogs-client)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/@lionralfs/discogs-client)
![build status](https://github.com/lionralfs/discogs-client/actions/workflows/node.js.yml/badge.svg?branch=main)

# `discogs-client`

## About

`discogs-client` is a [Node.js](https://nodejs.org) and browser client library that connects with the [Discogs.com API v2.0](https://www.discogs.com/developers/).

This library is a fork of the [original library](https://github.com/bartve/disconnect) which does the following:

-   uses ES Modules
-   uses esbuild to provide a bundle that is consumable by either:
    -   node via ESM
    -   node via CommonJS
    -   browsers (where node-fetch is replaced with native window.fetch)
-   uses TypeScript (and generating type declarations) for typed parameters and API results
-   adds docs and type info via JSDoc (for non-TypeScript users)
-   removes callbacks in favor of Promises
-   adds support for all remaining Discogs endpoints
-   adds more tests

## Features

-   Covers all API [endpoints](#structure)
-   Supports [pagination](#pagination), [rate limiting](#rate-limiting) and [throttling](#throttling)
-   API calls return a native JS [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
-   Easy access to protected endpoints with `Discogs Auth`
-   Includes OAuth 1.0a tools. Just plug in your consumer key and secret and do the OAuth dance
-   API functions grouped in their own namespace for easy access and isolation

## Installation

```
npm install @lionralfs/discogs-client
```

## Usage

### Quick start

Here are some basic usage examples that connect with the public API. Error handling has been left out for demonstrational purposes.

#### Importing the library

```js
// in modern JS/TS
import { DiscogsClient } from '@lionralfs/discogs-client';

// in commonjs environments
const DiscogsClient = require('@lionralfs/discogs-client/commonjs');

// in browser environments
import { DiscogsClient } from '@lionralfs/discogs-client/browser';
```

#### Go!

Get the release data for a release with the id 176126.

```js
let db = new DiscogsClient().database();
db.getRelease(176126).then(function ({ rateLimit, data }) {
    console.log(data);
});
```

Set your own custom [User-Agent](http://www.discogs.com/developers/#page:home,header:home-general-information). This is optional as when omitted it will set a default one with the value `@lionralfs/discogs-client/x.x.x` where `x.x.x` is the installed version of this library.

```js
let client = new DiscogsClient({ userAgent: 'MyUserAgent/1.0' });
```

Get page 2 of USER_NAME's public collection showing 75 releases.
The second param is the collection folder ID where 0 is always the "All" folder.

```js
let col = new DiscogsClient().user().collection();
col.getReleases('USER_NAME', 0, { page: 2, per_page: 75 }).then(function ({ data }) {
    console.log(data);
});
```

### Promises

The API functions return a native JS [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for easy chaining.

```js
let db = client.database();
db.search({ query: 'dark side of the moon', type: 'master' })
    .then(function ({ data }) {
        return db.getMaster(data.results[0].id);
    })
    .then(function ({ data }) {
        return db.getArtist(data.artists[0].id);
    })
    .then(function ({ data }) {
        console.log(data.name);
    });
```

### Output format

User, artist and label profiles can be formatted in different ways: `plaintext`, `html` and `discogs`. The client defaults to `discogs`, but the output format can be set for each client instance.

```js
// Set the output format to HTML
let client = new DiscogsClient().setConfig({ outputFormat: 'html' });
```

### Discogs Auth

Just provide the client constructor with your preferred way of [authentication](https://www.discogs.com/developers/#page:authentication).

```js
// Authenticate by user token
let client = new DiscogsClient({ auth: { userToken: 'YOUR_USER_TOKEN' } });

// Authenticate by consumer key and secret
let client = new DiscogsClient({
    auth: {
        method: 'discogs',
        consumerKey: 'YOUR_CONSUMER_KEY',
        consumerSecret: 'YOUR_CONSUMER_SECRET',
    },
});
```

The User-Agent can still be passed for authenticated calls.

```js
let client = new DiscogsClient({
    userAgent: 'MyUserAgent/1.0',
    auth: { userToken: 'YOUR_USER_TOKEN' },
});
```

### OAuth

Below are the steps that involve getting a valid OAuth access token from Discogs.

#### 1. Get a request token

```js
let oAuth = new DiscogsOAuth('YOUR_CONSUMER_KEY', 'YOUR_CONSUMER_SECRET');
let { token, tokenSecret, authorizeUrl } = await oAuth.getRequestToken('https://your-domain.com/callback');

// store token and tokenSecret in a cookie for example
// redirect user to authorizeUrl
```

#### 2. Authorize

After redirection to the Discogs authorize URL in step 1, authorize the application.

#### 3. Get an access token

```js
// in the callback endpoint, capture the oauth_verifier query parameter
// use the token and tokenSecret from step 1 to get an access token/secret
let { accessToken, accessTokenSecret } = await oAuth.getAccessToken(token, tokenSecret, oauth_verifier);
```

#### 4. Make OAuth calls

Instantiate a new DiscogsClient class with the required auth arguments to make requests on behalf of the authenticated user.

```js
let client = new DiscogsClient({
    auth: {
        method: 'oauth',
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        accessToken: accessToken,
        accessTokenSecret: accessTokenSecret,
    },
});

let response = await client.getIdentity();
console.log(response.data.username);
```

### Pagination

Discogs [paginates]() certain collections, as they would otherwise be too much to return for a single API call. You may use the `page` and `per_page` options in each call to query certain pages. If you don't pass these options, they fall back to the Discogs defaults, which are `1` and `50` respectively (the first 50 results on the first page).

In the `result.data` object, you'll find a `pagination` key, which contains some info returned by the Discogs API such as the total number of items and pages.

Here's a short example of how to use pagination arguments:

```js
// retrieves an artist's releases (25 per page, 2nd page)
let result = await client.database().getArtistReleases(108713, { per_page: 25, page: 2 });

console.log(result.data.pagination);
// {
//   page: 2,
//   pages: 54,
//   per_page: 25,
//   items: 1331,
//   urls: {
//     first: 'https://api.discogs.com/artists/108713/releases?per_page=25&page=1',
//     last: 'https://api.discogs.com/artists/108713/releases?per_page=25&page=54',
//     prev: 'https://api.discogs.com/artists/108713/releases?per_page=25&page=1',
//     next: 'https://api.discogs.com/artists/108713/releases?per_page=25&page=3'
//   }
// }
```

### Rate Limiting

The Discogs API imposes certain [rate limits](https://www.discogs.com/developers/#page:home,header:home-rate-limiting) on consumers, varying in allowed calls per minute depending on your authentication status. The API responds with your current quota in HTTP headers for each API call. These are passed to you as a `rateLimit` object on the response:

```js
let response = await client.database().getArtistReleases(108713);
console.log(response.rateLimit); // → { limit: 25, used: 4, remaining: 21 }
```

### Throttling

The client implements [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) when encountering Discogs-API responses with status code `429 Too Many Requests`. The exponential backoff can be configured via the following parameters:

```js
client.setConfig({
    exponentialBackoffIntervalMs: 2000,
    exponentialBackoffMaxRetries: 5,
    exponentialBackoffRate: 2.7,
});
```

> **Note**: By default, the `exponentialBackoffMaxRetries` is 0, essentially turning off throttling.

## Structure

The global library structure looks as follows:

```
new DiscogsClient() -> database()
                        -> getArtist
                        -> getArtistReleases
                        -> getRelease
                        -> getReleaseRating
                        -> setReleaseRating
                        -> getReleaseCommunityRating
                        -> getReleaseStats
                        -> getMaster
                        -> getMasterVersions
                        -> getLabel
                        -> getLabelReleases
                        -> search
                    -> marketplace()
                        -> getInventory
                        -> getListing
                        -> addListing
                        -> editListing
                        -> deleteListing
                        -> getOrders
                        -> getOrder
                        -> editOrder
                        -> getOrderMessages
                        -> addOrderMessage
                        -> getFee
                        -> getPriceSuggestions
                        -> getReleaseStats
                    -> inventory()
                        -> exportInventory
                        -> getExports
                        -> getExport
                        -> downloadExport
                    -> user()
                        -> getProfile
                        -> editProfile
                        -> getInventory
                        -> getIdentity
                        -> getContributions
                        -> getSubmissions
                        -> getLists
                        -> collection()
                            -> getFolders
                            -> getFolder
                            -> addFolder
                            -> setFolderName
                            -> deleteFolder
                            -> getReleases
                            -> getReleaseInstances
                            -> addRelease
                            -> editRelease
                            -> removeRelease
                            -> getFields
                            -> editInstanceNote
                            -> getValue
                        -> wantlist()
                            -> getReleases
                            -> addRelease
                            -> editNotes
                            -> removeRelease
                        -> list()
                            -> getItems
new DiscogsOAuth()  -> getRequestToken
                    -> getAccessToken
```

## Resources

-   [This fork's origin](https://github.com/bartve/disconnect)
-   [Discogs API documentation](https://www.discogs.com/developers/)
-   [OAuth Core 1.0 Revision A](https://oauth.net/core/1.0a/)

## License

MIT
