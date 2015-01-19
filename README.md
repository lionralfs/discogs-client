## About

`disconnect` is a [Node.js](http://www.nodejs.org) client library that connects with the [Discogs.com API v2.0](http://www.discogs.com/developers/).

[![NPM version](https://badge.fury.io/js/disconnect.svg)](http://badge.fury.io/js/disconnect) [![Dependency Status](https://david-dm.org/bartve/disconnect.png)](https://david-dm.org/bartve/disconnect)

## Features

  * Covers all API endpoints
  * Supports [pagination](http://www.discogs.com/developers/#page:home,header:home-pagination), [rate limiting](http://www.discogs.com/developers/#page:home,header:home-rate-limiting), etc.
  * All database, marketplace and user functions implement a standard `function(err, data, rateLimit)` format for the callback
  * Easy access to protected endpoints with `Discogs Auth`
  * Includes OAuth 1.0a tools. Just plug in your consumer key and secret and do the OAuth dance
  * API functions grouped in their own namespace for easy access and isolation
  
## Todo

  * Add [rate limiting](http://www.discogs.com/developers/accessing.html#rate-limiting) support
  * Add tests

## Installation

`$ npm install disconnect`

## Structure
The global structure of `disconnect` looks as follows:
```
require('disconnect') -> new Client() -> oauth()
									  -> database()
                                      -> marketplace()
                                      -> user() -> collection()
                                                -> wantlist()
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
db.release(176126, function(err, data){
	console.log(data);
});
```

Set your own custom [User-Agent](http://www.discogs.com/developers/accessing.html#required-headers). This is optional as when omitted `disconnect` will set a default one with the value `DisConnectClient/x.x.x` where `x.x.x` is the installed version of `disconnect`.
```javascript
var dis = new Discogs('MyUserAgent/1.0');
```

Get page 2 of USER_NAME's public collection showing 75 releases.
The second param is the collection folder ID where 0 is always the "All" folder.
```javascript
var col = new Discogs().user().collection();
col.releases('USER_NAME', 0, {page: 2, per_page: 75}, function(err, data){
	console.log(data);
});
```

### Discogs Auth
Just provide the client constructor with your preferred way of [authentication](http://www.discogs.com/developers/#page:authentication).
```javascript
// Authenticate by user token
var dis = new Discogs({userToken: 'YOUR_USER_TOKEN'});

// Authenticate by consumer key and secret
var dis = new Discogs({
	consumerKey: 'YOUR_CONSUMER_KEY', 
	consumerSecret: 'YOUR_CONSUMER_SECRET'
});
```

The User-Agent can still be passed for authenticated calls.
```javascript
var dis = new Discogs('MyUserAgent/1.0', {userToken: 'YOUR_USER_TOKEN'});
```

### OAuth
Below are the steps that involve getting a valid OAuth access token from Discogs. Note that in the following examples the `app` variable is an [Express instance](http://expressjs.com/starter/hello-world.html) to handle incoming HTTP requests.

#### 1. Get a request token
```javascript
app.get('/authorize', function(req, res){
	var oAuth = new Discogs().oauth();
	oAuth.getRequestToken(
		'YOUR_CONSUMER_KEY', 
		'YOUR_CONSUMER_SECRET', 
		'http://your-script-url/callback', 
		function(err, requestData){
			// Persist "requestData" here so that the callback handler can 
			// access it later after returning from the authorize url
			res.redirect(requestData.authorizeUrl);
		}
	);
});
```
#### 2. Authorize
After redirection to the Discogs authorize URL in step 1, authorize the application.

#### 3. Get an access token
```javascript
app.get('/callback', function(req, res){
	var oAuth = new Discogs(requestData).oauth();
	oAuth.getAccessToken(
		req.query.oauth_verifier, // Verification code sent back by Discogs
		function(err, accessData){
			// Persist "accessData" here for following OAuth calls 
			res.send('Received access token!');
		}
	);
});
```

#### 4. Make OAuth calls
Simply provide the constructor with the `accessData` object persisted in step 3.
```javascript
app.get('/identity', function(req, res){
	var dis = new Discogs(accessData);
	dis.identity(function(err, data){
		res.send(data);
	});
});
```

### Images
Image requests require authentication and are subject to [rate limiting](http://www.discogs.com/developers/accessing.html#rate-limiting).
```javascript
var db = new Discogs(accessData).database(), file = 'R-176126-1322456477.jpeg';
db.image(file, function(err, data, rateLimit){
	// Data contains the raw binary image data
	require('fs').writeFile(file, data, 'binary', function(err){
		// See your current limits
		console.log(rateLimit);
		console.log('Image saved!');
	});
});
```

## Resources

  * [Discogs API documentation](http://www.discogs.com/developers/)
  * [The OAuth Bible](http://oauthbible.com/)

## License

MIT