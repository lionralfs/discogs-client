import user from './user.js';
import { toQueryString } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./database.js').Currency} Currency
 * @typedef {'Mint (M)' | 'Near Mint (NM or M-)' | 'Very Good Plus (VG+)' | 'Very Good (VG)' | 'Good Plus (G+)' | 'Good (G)' | 'Fair (F)' | 'Poor (P)'} Condition
 * @typedef {'Draft' | 'For Sale' | 'Expired'} Status
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let marketplace = {};

    /**
     * Copy the getInventory function from the user module
     *
     * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-inventory-get
     */
    marketplace.getInventory = user(client).getInventory;

    /**
     * Get a marketplace listing
     * @param {number} listing - The listing ID
     * @param {Currency} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY.
     * @returns {Promise<import('./client.js').RateLimitedResponse<import('./user.js').Listing>>}
     *
     * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-listing-get
     *
     * @example
     * await client.marketplace().getListing(172723812, 'USD');
     */
    marketplace.getListing = function (listing, currency) {
        let path = `/marketplace/listings/${listing}`;
        if (currency !== undefined) {
            path += `?${toQueryString({ curr_abbr: currency })}`;
        }
        return client.get(path);
    };

    /**
     * Create a marketplace listing
     * @param {object} data - The data for the listing
     * @returns {Promise<unknown>}
     */
    marketplace.addListing = function (data) {
        return client.post({ url: '/marketplace/listings', authLevel: 2 }, data);
    };

    /**
     * Edit a marketplace listing
     * @param {number} listing - The listing ID
     * @param {{release_id: number; condition: Condition; price: number; status: Status} & Partial<{sleeve_condition: Condition; comments: string; allow_offers: boolean; external_id: string; location: string; weight: number | 'auto'; format_quantity: number | 'auto'}>} data - The data for the listing
     * @returns {Promise<import('./client.js').RateLimitedResponse<void>>}
     *
     * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-listing-post
     *
     * @example
     * await client.marketplace().editListing(172723812, {
     *     release_id: 1,
     *     condition: 'Mint (M)',
     *     sleeve_condition: 'Fair (F)',
     *     price: 10,
     *     comments: 'This item is wonderful',
     *     allow_offers: true,
     *     status: 'Draft',
     *     external_id: '1234321',
     *     location: 'top shelf',
     *     weight: 200,
     *     format_quantity: 'auto',
     * });
     */
    marketplace.editListing = function (listing, data) {
        return client.post({ url: `/marketplace/listings/${listing}`, authLevel: 2 }, data);
    };

    /**
     * Delete a marketplace listing
     * @param {(number|string)} listing - The listing ID
     * @returns {Promise<unknown>}
     */
    marketplace.deleteListing = function (listing) {
        return client.delete({ url: `/marketplace/listings/${listing}`, authLevel: 2 });
    };

    /**
     * Get a list of the authenticated user's orders
     * @param {object} [params] - Optional sorting and pagination params
     * @returns {Promise<unknown>}
     */
    marketplace.getOrders = function (params) {
        let path = `/marketplace/orders?${toQueryString(params)}`;
        return client.get({ url: path, authLevel: 2 });
    };

    /**
     * Get details of a marketplace order
     * @param {string} order - The order ID
     * @returns {Promise<unknown>}
     */
    marketplace.getOrder = function (order) {
        return client.get({ url: `/marketplace/orders/${order}`, authLevel: 2 });
    };

    /**
     * Edit a marketplace order
     * @param {string} order - The order ID
     * @param {object} data - The data for the order
     * @returns {Promise<unknown>}
     */
    marketplace.editOrder = function (order, data) {
        return client.post({ url: `/marketplace/orders/${order}`, authLevel: 2 }, data);
    };

    /**
     * List the messages for the given order ID
     * @param {string} order - The order ID
     * @param {object} [params] - Optional pagination parameters
     * @returns {Promise<unknown>}
     */
    marketplace.getOrderMessages = function (order, params) {
        let path = `/marketplace/orders/${order}/messages?${toQueryString(params)}`;
        return client.get({ url: path, authLevel: 2 });
    };

    /**
     * Add a message to the given order ID
     * @param {string} order - The order ID
     * @param {object} data - The message data
     * @returns {Promise<unknown>}
     */
    marketplace.addOrderMessage = function (order, data) {
        return client.post({ url: '/marketplace/orders/' + order + '/messages', authLevel: 2 }, data);
    };

    /**
     * Get the marketplace fee for a given price
     * @param {(number|string)} price - The price as a number or string
     * @param {Currency} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
     * @returns {Promise<unknown>}
     */
    marketplace.getFee = function (price, currency) {
        let path = '/marketplace/fee/' + (typeof price === 'number' ? price.toFixed(2) : price);
        if (currency) {
            // Get the fee in a given currency
            path += '/' + currency;
        }
        return client.get(path);
    };

    /**
     * Get price suggestions for a given release ID in the user's selling currency
     * @param {(number|string)} release - The release ID
     * @returns {Promise<unknown>}
     */
    marketplace.getPriceSuggestions = function (release) {
        return client.get({ url: `/marketplace/price_suggestions/${release}`, authLevel: 2 });
    };

    return marketplace;
}
