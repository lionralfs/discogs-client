/* eslint-disable */
const { DiscogsClient } = require('../../commonjs');

let client = new DiscogsClient();
if (!(client instanceof DiscogsClient)) {
    process.exit(1);
}
