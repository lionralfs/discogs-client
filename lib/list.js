'use strict';

import { escape, addParams } from './util.js';

export default function (client) {
    var list = {};

    /**
     * Get the items in a list by list ID
     * @param {(number|string)} list - The list ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */

    list.getItems = function (list, params, callback) {
        var path = '/lists/' + escape(list);
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    return list;
}
