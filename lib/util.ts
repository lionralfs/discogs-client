/**
 * Strip the trailing number from a Discogs artist name Artist (2) -> Artist
 * @param {string} name - The Discogs artist name
 * @returns {string}
 */
export function stripVariation(name: string): string {
    return name.replace(/\s\(\d+\)$/, '');
}

/**
 * Turns a simple key-value object into a query string (including the leading questionmark)
 * @param {Record<string, string | number>} data - Data object containing the params
 * @returns {string}
 */
export function toQueryString(data?: Record<PropertyKey, string | number | boolean>): string {
    if (!data || !Object.keys(data).length) {
        return '';
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        searchParams.set(key, value.toString());
    }
    return '?' + searchParams.toString();
}

/**
 * Escape a string for use in a query string
 * @param {string} str - The string to escape
 * @returns {string}
 */
export function escape(str: string): string {
    return encodeURIComponent(str);
}

/**
 * Deep merge two objects
 * @param {object} target - The target object (by reference!)
 * @param {object} source - The source object
 * @returns {object}
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function merge(target: Record<any, any>, source: Record<any, any>): Record<any, any> {
    for (const key in source) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = source[key];
        if (isObject(value)) {
            target[key] = merge(Array.isArray(value) ? [] : {}, value);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            target[key] = value;
        }
    }
    return target;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObject(value: any): value is object {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value && typeof value === 'object';
}
