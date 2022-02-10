import { type DiscogsClient } from './client.js';
import {
    type RateLimitedResponse,
    type PaginationParameters,
    type PaginationResponse,
    type Currency,
    type Listing,
    type SortParameters,
    type GetReleaseResponse,
    type Label,
} from './types.js';
import collection from './collection.js';
import list from './list.js';
import { escape, toQueryString } from './util.js';
import wantlist from './wantlist.js';

type GetProfileResponse = {
    email?: string;
    num_unread?: number;
    activated: boolean;
    marketplace_suspended: boolean;
    is_staff: boolean;
    profile: string;
    wantlist_url: string;
    rank: number;
    num_pending: number;
    id: number;
    num_for_sale: number;
    home_page: string;
    location: string;
    collection_folders_url: string;
    username: string;
    collection_fields_url: string;
    releases_contributed: number;
    registered: string;
    rating_avg: number;
    num_collection: number;
    releases_rated: number;
    num_lists: number;
    name: string;
    num_wantlist: number;
    inventory_url: string;
    avatar_url: string;
    banner_url: string;
    uri: string;
    resource_url: string;
    buyer_rating: number;
    buyer_rating_stars: number;
    buyer_num_ratings: number;
    seller_rating: number;
    seller_rating_stars: number;
    seller_num_ratings: number;
    curr_abbr: Currency;
};
type GetInventoryResponse = { listings: Array<Listing> };
type GetContributionsResponse = { contributions: Array<GetReleaseResponse> };
type GetSubmissionsResponse = {
    submissions: {
        artists: Array<{
            data_quality: string;
            id: number;
            name: string;
            namevariations?: Array<string>;
            releases_url: string;
            resource_url: string;
            uri: string;
        }>;
        labels: Array<Label>;
        releases: Array<GetReleaseResponse>;
    };
};
type GetListsResponse = {
    lists: Array<{
        date_added: string;
        date_changed: string;
        name: string;
        id: number;
        uri: string;
        resource_url: string;
        public: boolean;
        description: string;
    }>;
};

/**
 * @param {DiscogsClient} client
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Get the profile for the given user
         * @param {string} username - The user name
         * @returns {Promise<RateLimitedResponse<GetProfileResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-profile-get
         *
         * @example
         * await client.user().getProfile('rodneyfool');
         */
        getProfile: function (username: string): Promise<RateLimitedResponse<GetProfileResponse>> {
            // @ts-ignore
            return client.get(`/users/${escape(username)}`);
        },

        /**
         * Edit a user's profile data.
         * @param {string} username - The user name
         * @param {Partial<{ name: string; home_page: string; location: string; profile: string; curr_abbr: Currency}>} [data] - The profile data
         * @returns {Promise<RateLimitedResponse<GetProfileResponse>>}
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
        editProfile: function (
            username: string,
            data: Partial<{ name: string; home_page: string; location: string; profile: string; curr_abbr: Currency }>
        ): Promise<RateLimitedResponse<GetProfileResponse>> {
            // @ts-ignore
            return client.post(`/users/${escape(username)}`, data);
        },

        /**
         * Get the inventory for the given user
         * @param {string} user - The user name
         * @param {Partial<{status: string}> & PaginationParameters & SortParameters<'listed'|'price'|'item'|'artist'|'label'|'catno'|'audio'|'status'|'location'>} [params] - Extra params like status, sort and sort_order, pagination
         * @returns {Promise<RateLimitedResponse<GetInventoryResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-inventory
         *
         * @example
         * await client.user().getInventory('rodneyfool', { status: 'for sale', page: 3, per_page: 25, sort: 'status', sort_order: 'asc' });
         */
        getInventory: function (
            user: string,
            params: Partial<{ status: string }> &
                PaginationParameters &
                SortParameters<
                    'listed' | 'price' | 'item' | 'artist' | 'label' | 'catno' | 'audio' | 'status' | 'location'
                >
        ): Promise<RateLimitedResponse<GetInventoryResponse & PaginationResponse>> {
            let path = `/users/${escape(user)}/inventory?${toQueryString(params)}`;
            // @ts-ignore
            return client.get(path);
        },

        /**
         * Copy the client getIdentity function to the user module
         */
        getIdentity: client.getIdentity,

        /**
         * Expose the collection functions and pass the client instance
         * @returns {ReturnType<typeof collection>}
         */
        collection: function (): ReturnType<typeof collection> {
            return collection(client);
        },

        /**
         * Expose the wantlist functions and pass the client instance
         * @returns {ReturnType<typeof wantlist>}
         */
        wantlist: function (): ReturnType<typeof wantlist> {
            return wantlist(client);
        },

        /**
         * Expose the list functions and pass the client instance
         * @returns {ReturnType<list>}
         */
        list: function (): ReturnType<typeof list> {
            return list(client);
        },

        /**
         * Get the contributions for the given user
         * @param {string} user - The user name
         * @param {PaginationParameters & SortParameters<'label'|'artist'|'title'|'catno'|'format'|'rating'|'year'|'added'>} [params] - Optional pagination and sorting params
         * @returns {Promise<RateLimitedResponse<GetContributionsResponse & PaginationResponse>>}
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
        getContributions: function (
            user: string,
            params: PaginationParameters &
                SortParameters<'label' | 'artist' | 'title' | 'catno' | 'format' | 'rating' | 'year' | 'added'>
        ): Promise<RateLimitedResponse<GetContributionsResponse & PaginationResponse>> {
            let path = `/users/${escape(user)}/contributions?${toQueryString(params)}`;
            // @ts-ignore
            return client.get(path);
        },

        /**
         * Get the submissions for the given user
         * @param {string} user - The user name
         * @param {PaginationParameters} [params] - Optional pagination params
         * @returns {Promise<RateLimitedResponse<PaginationResponse & GetSubmissionsResponse}>>}
         *
         * @see https://www.discogs.com/developers/#page:user-identity,header:user-identity-user-submissions-get
         *
         * @example
         * await client.user().getSubmissions('rodneyfool', { page: 2, per_page: 100 });
         */
        getSubmissions: function (
            user: string,
            params: PaginationParameters
        ): Promise<RateLimitedResponse<PaginationResponse & GetSubmissionsResponse>> {
            let path = `/users/${escape(user)}/submissions?${toQueryString(params)}`;
            // @ts-ignore
            return client.get(path);
        },

        /**
         * Get the lists for the given user
         * @param {string} user - The user name
         * @param {PaginationParameters} [params] - Optional pagination params
         * @returns {Promise<RateLimitedResponse<PaginationResponse & GetListsResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-lists,header:user-lists-user-lists-get
         *
         * @example
         * await client.user().getLists('rodneyfool', { page: 3, per_page: 25 });
         */
        getLists: function (
            user: string,
            params: PaginationParameters
        ): Promise<RateLimitedResponse<PaginationResponse & GetListsResponse>> {
            let path = `/users/${escape(user)}/lists?${toQueryString(params)}`;
            // @ts-ignore
            return client.get(path);
        },
    };
}
