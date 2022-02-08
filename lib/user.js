import collection from './collection.js';
import list from './list.js';
import { escape, toQueryString } from './util.js';
import wantlist from './wantlist.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').PaginationParameters} PaginationParameters
 * @typedef {import('./database.js').Currency} Currency
 * @typedef {import('./database.js').Price} Price
 * @typedef {{username: string; resource_url: string; id: number}} Seller
 * @typedef {{catalog_number: string; resource_url: string; year: number; id: number; description: string; images: Array<import('./database.js').Image>; artist: string; title: string; format: string; thumbnail: string; stats: { community: { in_wantlist: number; in_collection: number }; user?: { in_wantlist: number; in_collection: number }; }}} Release
 * @typedef {{weight?: string; format_quantity?: number; external_id?: number; location?: string; in_cart?: boolean; status: string; price: Price; original_price: OriginalPrice; shipping_price: Price; original_shipping_price: Price; allow_offers: boolean; sleeve_condition: string; id: number; condition: string; posted: string; ships_from: string; uri: string; comments: string; seller: Seller; release: Release; resource_url: string; audio: boolean;}} Listing
 * @typedef {{curr_abbr: Currency; curr_id: number; formatted: string; value: number}} OriginalPrice
 * @typedef {{id: number; name: string; resource_url: string; uri: string; releases_url: string; images: Array<import('./database.js').Image>; contactinfo: string; profile: string; data_quality: string; sublabels: Array<string>}} Label
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let user = {};

    /**
     * Get the profile for the given user
     * @param {string} username - The user name
     * @typedef {{email?: string; num_unread?: activated: boolean; marketplace_suspended: boolean; is_staff: boolean; number; profile: string; wantlist_url: string; rank: number; num_pending: number; id: number; num_for_sale: number; home_page: string; location: string; collection_folders_url: string; username: string; collection_fields_url: string; releases_contributed: number; registered: string; rating_avg: number; num_collection: number; releases_rated: number; num_lists: number; name: string; num_wantlist: number; inventory_url: string; avatar_url: string; banner_url: string; uri: string; resource_url: string; buyer_rating: number; buyer_rating_stars: number; buyer_num_ratings: number; seller_rating: number; seller_rating_stars: number; seller_num_ratings: number; curr_abbr: Currency}} GetProfileResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetProfileResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-profile-get
     *
     * @example
     * await client.user().getProfile('rodneyfool');
     */
    user.getProfile = function (username) {
        return client.get(`/users/${escape(username)}`);
    };

    /**
     * Edit a user's profile data.
     * @param {string} username - The user name
     * @param {Partial<{ name: string; home_page: string; location: string; profile: string; curr_abbr: Currency}>} [data] - The profile data
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetProfileResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-profile-post
     *
     * @example
     * await client.user().editProfile('rodneyfool', {
     *     name: 'Nicolas Cage',
     *     home_page: 'www.discogs.com',
     *     location: 'Portland',
     *     profile: 'I am a Discogs user!',
     *     curr_abbr: 'USD',
     * });
     */
    user.editProfile = function (username, data) {
        return client.post(`/users/${escape(username)}`, data);
    };

    /**
     * Get the inventory for the given user
     * @param {string} user - The user name
     * @param {Partial<{status: string}> & PaginationParameters & import('./client.js').SortParameters<'listed'|'price'|'item'|'artist'|'label'|'catno'|'audio'|'status'|'location'>} [params] - Extra params like status, sort and sort_order, pagination
     * @typedef {{listings: Array<Listing>}} GetInventoryResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetInventoryResponse & import('./client.js').PaginationResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-inventory
     *
     * @example
     * await client.user().getInventory('rodneyfool', { status: 'for sale', page: 3, per_page: 25, sort: 'status', sort_order: 'asc' });
     */
    user.getInventory = function (user, params) {
        let path = `/users/${escape(user)}/inventory?${toQueryString(params)}`;
        return client.get(path);
    };

    /**
     * Copy the client getIdentity function to the user module
     */
    user.getIdentity = client.getIdentity;

    /**
     * Expose the collection functions and pass the client instance
     * @returns {ReturnType<collection>}
     */
    user.collection = function () {
        return collection(client);
    };

    /**
     * Expose the wantlist functions and pass the client instance
     * @returns {ReturnType<wantlist>}
     */
    user.wantlist = function () {
        return wantlist(client);
    };

    /**
     * Expose the list functions and pass the client instance
     * @returns {ReturnType<list>}
     */
    user.list = function () {
        return list(client);
    };

    /**
     * Get the contributions for the given user
     * @param {string} user - The user name
     * @param {PaginationParameters & import('./client.js').SortParameters<'label'|'artist'|'title'|'catno'|'format'|'rating'|'year'|'added'>} [params] - Optional pagination and sorting params
     * @typedef {{contributions: Array<import('./database.js').GetReleaseResponse>}} GetContributionsResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetContributionsResponse & import('./client.js').PaginationResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-user-contributions-get
     *
     * @example
     * await client.user().getContributions('rodneyfool', {
     *     page: 2,
     *     per_page: 50,
     *     sort: 'artist',
     *     sort_order: 'desc'
     * });
     */
    user.getContributions = function (user, params) {
        let path = `/users/${escape(user)}/contributions?${toQueryString(params)}`;
        return client.get(path);
    };

    /**
     * Get the submissions for the given user
     * @param {string} user - The user name
     * @param {PaginationParameters} [params] - Optional pagination params
     * @returns {Promise<import('./client.js').RateLimitedResponse<import('./client.js').PaginationResponse & {submissions: {artists: Array<{data_quality: string; id: number; name: string; namevariations?: Array<string>; releases_url: string; resource_url: string; uri: string;}>; labels: Array<Label>; releases: Array<import('./database.js').GetReleaseResponse>>}}>>}
     *
     * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-user-submissions-get
     *
     * @example
     * await client.user().getSubmissions('rodneyfool', { page: 2, per_page: 100 });
     */
    user.getSubmissions = function (user, params) {
        let path = `/users/${escape(user)}/submissions?${toQueryString(params)}`;
        return client.get(path);
    };

    /**
     * Get the lists for the given user
     * @param {string} user - The user name
     * @param {PaginationParameters} [params] - Optional pagination params
     * @returns {Promise<import('./client.js').RateLimitedResponse<import('./client.js').PaginationResponse & {lists: Array<{date_added: string; date_changed: string; name: string; id: number; uri: string; resource_url: string; public: boolean; description: string;}>}>>}
     *
     * @see https://www.discogs.com/developers/#page:user-lists,header:user-lists-user-lists-get
     *
     * @example
     * await client.user().getLists('rodneyfool', { page: 3, per_page: 25 });
     */
    user.getLists = function (user, params) {
        let path = `/users/${escape(user)}/lists?${toQueryString(params)}`;
        return client.get(path);
    };

    return user;
}
