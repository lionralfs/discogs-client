/* eslint-disable */
import { DiscogsClient } from '../../node-esm/index.js';

let client = new DiscogsClient();
if (!(client instanceof DiscogsClient)) {
    process.exit(1);
}
