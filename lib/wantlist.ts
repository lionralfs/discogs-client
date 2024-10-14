import { type DiscogsClient } from './client.js';
import {
    type PaginationParameters,
    type PaginationResponse,
    type RateLimitedResponse,
    type Artist,
    type LabelShort,
} from './types.js';
import { escape, toQueryString } from './util.js';

export type WantlistFormat = { text: string; qty: number; descriptions: Array<string>; name: string };
export type WantlistEntryResponse = {
    resource_url: string;
    id: number;
    notes?: string;
    rating: number;
    basic_information: {
        resource_url: string;
        id: number;
        formats: Array<WantlistFormat>;
        thumb: string;
        cover_image: string;
        title: string;
        labels: Array<LabelShort>;
        year: number;
        artists: Array<Artist>;
        genres: Array<string>;
        styles: Array<string>;
    };
};

/**
 * @param {DiscogsClient} client
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Get the list of wantlisted releases for the given user name
         * @param {string} user - The user name
         * @param {PaginationParameters} [params] - Optional pagination params
         * @returns {Promise<RateLimitedResponse<PaginationResponse & {wants: Array<WantlistEntryResponse>}>>}
         *
         * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-wantlist-get
         *
         * @example
         * await client.user().wantlist().getReleases('rodneyfool', { page: 2, per_page: 4 });
         */
        getReleases: function (
            user: string,
            params?: PaginationParameters
        ): Promise<RateLimitedResponse<PaginationResponse & { wants: Array<WantlistEntryResponse> }>> {
            const path = `/users/${escape(user)}/wants${toQueryString(params)}`;

            return client.get(path) as Promise<
                RateLimitedResponse<PaginationResponse & { wants: Array<WantlistEntryResponse> }>
            >;
        },

        /**
         * Add a release to the user's wantlist
         * @param {string} user - The user name
         * @param {(number|string)} release - The release ID
         * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - Optional notes and rating
         * @returns {Promise<RateLimitedResponse<WantlistEntryResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-add-to-wantlist-put
         *
         * @example
         * await client.user().wantlist().addRelease('rodneyfool', 130076, { notes: 'My favorite release', rating: 5 });
         */
        addRelease: function (
            user: string,
            release: number | string,
            data: { notes?: string; rating?: 0 | 1 | 2 | 3 | 4 | 5 }
        ): Promise<RateLimitedResponse<WantlistEntryResponse>> {
            return client.put({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }, data) as Promise<
                RateLimitedResponse<WantlistEntryResponse>
            >;
        },

        /**
         * Edit the notes or rating on a release in the user's wantlist
         * @param {string} user - The user name
         * @param {(number|string)} release - The release ID
         * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - The notes and rating { notes: 'Test', rating: 4 }
         * @returns {Promise<RateLimitedResponse<WantlistEntryResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-add-to-wantlist-post
         *
         * @example
         * await client.user().wantlist().editNotes('rodneyfool', 130076, { notes: 'My favorite release', rating: 4 });
         */
        editNotes: function (
            user: string,
            release: number | string,
            data: { notes?: string; rating?: 0 | 1 | 2 | 3 | 4 | 5 }
        ): Promise<RateLimitedResponse<WantlistEntryResponse>> {
            return client.post({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }, data) as Promise<
                RateLimitedResponse<WantlistEntryResponse>
            >;
        },

        /**
         * Remove a release from the user's wantlist
         * @param {string} user - The user name
         * @param {(number|string)} release - The release ID
         * @returns {Promise<RateLimitedResponse<void>>}
         *
         * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-add-to-wantlist-delete
         *
         * @example
         * await client.user().wantlist().removeRelease('rodneyfool', 130076);
         */
        removeRelease: function (user: string, release: number | string): Promise<RateLimitedResponse<void>> {
            return client.delete({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }) as Promise<
                RateLimitedResponse<void>
            >;
        },
    };
}
