[#2](https://github.com/lionralfs/disconnect/pull/2) is a giant refactor of the [origial library](https://github.com/bartve/disconnect) by doing the following:

-   using ES Modules
-   using TypeScript (and generating type declarations) for typed parameters and API results
-   removing callbacks in favor of Promises
-   using Esbuild to provide a bundle that is consumable by either:
    -   node via ESM
    -   node via CommonJS
    -   browsers (where node-fetch is replaced with native window.fetch)
-   adding support for all remaining Discogs endpoints
-   adding more tests
-   adding docs and type info via JSDoc (for non-TypeScript users)

## About

`disconnect` is a [Node.js](http://www.nodejs.org) client library that connects with the [Discogs.com API v2.0](http://www.discogs.com/developers/).

## Features

-   Covers all API endpoints
-   Supports [pagination](http://www.discogs.com/developers/#page:home,header:home-pagination), [rate limiting](http://www.discogs.com/developers/#page:home,header:home-rate-limiting), etc.
-   All database, marketplace and user functions implement a standard `function(err, data, rateLimit)` format for the callback or return a
    native JS [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) when no callback is provided
-   Easy access to protected endpoints with `Discogs Auth`
-   Includes OAuth 1.0a tools. Just plug in your consumer key and secret and do the OAuth dance
-   API functions grouped in their own namespace for easy access and isolation

## Installation

[![NPM](https://nodei.co/npm/disconnect.png?downloads=true)](https://nodei.co/npm/disconnect/)

## Structure

The global structure of `disconnect` looks as follows:

```
require('disconnect') -> new Client() -> oauth()
                                      -> database()
                                      -> marketplace()
                                      -> user() -> collection()
                                                -> wantlist()
                                                -> list()
                      -> util
```

## Usage

### Quick start

Here are some basic usage examples that connect with the public API. Error handling has been left out for demonstrational purposes.

#### Init

```javascript
var Discogs = require('disconnect').Client;
```

#### Go!

Get the release data for a release with the id 176126.

```javascript
var db = new Discogs().database();
db.getRelease(176126, function (err, data) {
    console.log(data);
});
```

Set your own custom [User-Agent](http://www.discogs.com/developers/#page:home,header:home-general-information). This is optional as when omitted `disconnect` will set a default one with the value `DisConnectClient/x.x.x` where `x.x.x` is the installed version of `disconnect`.

```javascript
var dis = new Discogs('MyUserAgent/1.0');
```

Get page 2 of USER_NAME's public collection showing 75 releases.
The second param is the collection folder ID where 0 is always the "All" folder.

```javascript
var col = new Discogs().user().collection();
col.getReleases('USER_NAME', 0, { page: 2, per_page: 75 }, function (err, data) {
    console.log(data);
});
```

### Promises

When no callback is provided, the API functions return a native JS [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for easy chaining.

```javascript
var db = new Discogs().database();
db.getRelease(1)
    .then(function (release) {
        return db.getArtist(release.artists[0].id);
    })
    .then(function (artist) {
        console.log(artist.name);
    });
```

### Output format

User, artist and label profiles can be formatted in different ways: `plaintext`, `html` and `discogs`. `disconnect` defaults to `discogs`, but the output format can be set for each client instance.

```javascript
// Set the output format to HTML
var dis = new Discogs().setConfig({ outputFormat: 'html' });
```

### Discogs Auth

Just provide the client constructor with your preferred way of [authentication](https://www.discogs.com/developers/#page:authentication).

```js
// Authenticate by user token
let client = new DiscogsClient({ auth: { userToken: 'YOUR_USER_TOKEN' } });

// Authenticate by consumer key and secret
let client = new Discogs({
    auth: {
        method: 'discogs',
        consumerKey: 'YOUR_CONSUMER_KEY',
        consumerSecret: 'YOUR_CONSUMER_SECRET',
    },
});
```

The User-Agent can still be passed for authenticated calls.

```js
var dis = new Discogs({ userAgent: 'MyUserAgent/1.0', auth: { userToken: 'YOUR_USER_TOKEN' } });
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

### Images

Image requests themselves don't require authentication, but obtaining the image URLs through, for example, release data does.

```javascript
var db = new Discogs(accessData).database();
db.getRelease(176126, function (err, data) {
    var url = data.images[0].resource_url;
    db.getImage(url, function (err, data, rateLimit) {
        // Data contains the raw binary image data
        require('fs').writeFile('/tmp/image.jpg', data, 'binary', function (err) {
            console.log('Image saved!');
        });
    });
});
```

## Resources

-   [Discogs API documentation](https://www.discogs.com/developers/)
-   [OAuth Core 1.0 Revision A](https://oauth.net/core/1.0a/)

## License

MIT
