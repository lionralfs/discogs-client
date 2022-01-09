import user from './user.js';
import { addParams } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let marketplace = {};

    /**
     * Copy the getInventory function from the user module
     */
    marketplace.getInventory = user(client).getInventory;

    /**
     * Get a marketplace listing
     * @param {(number|string)} listing - The listing ID
     * @return {Promise<unknown>}
     */
    marketplace.getListing = function (listing) {
        return client.get(`/marketplace/listings/${listing}`);
    };

    /**
     * Create a marketplace listing
     * @param {object} data - The data for the listing
     * @return {Promise<unknown>}
     */
    marketplace.addListing = function (data) {
        return client.post({ url: '/marketplace/listings', authLevel: 2 }, data);
    };

    /**
     * Edit a marketplace listing
     * @param {(number|string)} listing - The listing ID
     * @param {object} data - The data for the listing
     * @return {Promise<unknown>}
     */
    marketplace.editListing = function (listing, data) {
        return client.post({ url: `/marketplace/listings/${listing}`, authLevel: 2 }, data);
    };

    /**
     * Delete a marketplace listing
     * @param {(number|string)} listing - The listing ID
     * @return {Promise<unknown>}
     */
    marketplace.deleteListing = function (listing) {
        return client.delete({ url: `/marketplace/listings/${listing}`, authLevel: 2 });
    };

    /**
     * Get a list of the authenticated user's orders
     * @param {object} [params] - Optional sorting and pagination params
     * @return {Promise<unknown>}
     */
    marketplace.getOrders = function (params) {
        let path = '/marketplace/orders';
        if (typeof params === 'object') {
            path = addParams(path, params);
        }
        return client.get({ url: path, authLevel: 2 });
    };

    /**
     * Get details of a marketplace order
     * @param {string} order - The order ID
     * @return {Promise<unknown>}
     */
    marketplace.getOrder = function (order) {
        return client.get({ url: `/marketplace/orders/${order}`, authLevel: 2 });
    };

    /**
     * Edit a marketplace order
     * @param {string} order - The order ID
     * @param {object} data - The data for the order
     * @return {Promise<unknown>}
     */
    marketplace.editOrder = function (order, data) {
        return client.post({ url: `/marketplace/orders/${order}`, authLevel: 2 }, data);
    };

    /**
     * List the messages for the given order ID
     * @param {string} order - The order ID
     * @param {object} [params] - Optional pagination parameters
     * @return {Promise<unknown>}
     */
    marketplace.getOrderMessages = function (order, params) {
        let path = `/marketplace/orders/${order}/messages`;
        path = addParams(path, params);
        return client.get({ url: path, authLevel: 2 });
    };

    /**
     * Add a message to the given order ID
     * @param {string} order - The order ID
     * @param {object} data - The message data
     * @return {Promise<unknown>}
     */
    marketplace.addOrderMessage = function (order, data) {
        return client.post({ url: '/marketplace/orders/' + order + '/messages', authLevel: 2 }, data);
    };

    /**
     * Get the marketplace fee for a given price
     * @param {(number|string)} price - The price as a number or string
     * @param {import('./database.js').Currency} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
     * @return {Promise<unknown>}
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
     * @return {Promise<unknown>}
     */
    marketplace.getPriceSuggestions = function (release) {
        return client.get({ url: `/marketplace/price_suggestions/${release}`, authLevel: 2 });
    };

    return marketplace;
}
