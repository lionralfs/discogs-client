import { stringify } from 'querystring';

/**
 * Strip the trailing number from a Discogs artist name Artist (2) -> Artist
 * @param {string} name - The Discogs artist name
 * @returns {string}
 */
export function stripVariation(name) {
    return name.replace(/\s\(\d+\)$/, '');
}

/**
 * Turns a sinple key-value object into a query string
 * @param {Record<string, string | number>} data - Data object containing the params
 * @returns {string}
 */
export function toQueryString(data) {
    if (!data) {
        return '';
    }

    let searchParams = new URLSearchParams();
    for (let [key, value] of Object.entries(data)) {
        searchParams.set(key, value.toString());
    }
    return searchParams.toString();
}

/**
 * Escape a string for use in a query string
 * @param {string} str - The string to escape
 * @returns {string}
 */
export function escape(str) {
    return encodeURIComponent(str);
}

/**
 * Deep merge two objects
 * @param {object} target - The target object (by reference!)
 * @param {object} source - The source object
 * @returns {object}
 */
export function merge(target, source) {
    for (let key in source) {
        if (source[key] && typeof source[key] === 'object') {
            target[key] = merge(Array.isArray(source[key]) ? [] : {}, source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}
