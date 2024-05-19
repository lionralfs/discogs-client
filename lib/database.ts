import { type DiscogsClient } from './client.js';
import {
    type Image,
    type GetReleaseResponse,
    type RateLimitedResponse,
    type Artist,
    type Tracklisting,
    type PaginationParameters,
    type Currency,
    type SortParameters,
    type PaginationResponse,
    type Status,
} from './types.js';
import { toQueryString, escape } from './util.js';
export type GetArtistResponse = {
    name: string;
    namevariations: Array<string>;
    profile: string;
    releases_url: string;
    resource_url: string;
    uri: string;
    urls: Array<string>;
    data_quality: string;
    id: number;
    images: Array<Image>;
    members: Array<{ active: boolean; id: number; name: string; resource_url: string }>;
};
export type GetArtistReleasesResponses = {
    releases: Array<{
        artist: string;
        id: number;
        main_release: number;
        resource_url: string;
        role: string;
        thumb: string;
        title: string;
        type: string;
        year: number;
    }>;
};
export type GetReleaseRatingResponse = { username: string; release_id: number; rating: number };
export type GetReleaseCommunityRatingResponse = { rating: { count: number; average: number }; release_id: number };
export type GetReleaseStatsResponse = { num_have: number; num_want: number };
export type GetMasterResponse = {
    styles: Array<string>;
    genres: Array<string>;
    videos: Array<{ duration: number; description: string; embed: boolean; uri: string; title: string }>;
    title: string;
    main_release: number;
    main_release_url: string;
    uri: string;
    artists: Array<Artist>;
    versions_url: string;
    year: number;
    images: Array<Image>;
    resource_url: string;
    tracklist: Array<Tracklisting>;
    id: number;
    num_for_sale: number;
    lowest_price: number;
    data_quality: string;
};
export type GetMasterVersionsResponse = {
    versions: Array<{
        status: Status;
        stats: {
            user: { in_collection: number; in_wantlist: number };
            community: { in_collection: number; in_wantlist: number };
        };
        thumb: string;
        format: string;
        country: string;
        title: string;
        label: string;
        released: string;
        major_formats: Array<string>;
        catno: string;
        resource_url: string;
        id: number;
    }>;
};
export type GetLabelResponse = {
    profile: string;
    releases_url: string;
    name: string;
    contact_info: string;
    uri: string;
    sublabels: Array<{ resource_url: string; id: number; name: string }>;
    urls: Array<string>;
    images: Array<Image>;
    resource_url: string;
    id: number;
    data_quality: string;
};
export type GetLabelReleasesResponse = {
    releases: Array<{
        artist: string;
        catno: string;
        format: string;
        id: number;
        resource_url: string;
        status: Status;
        thumb: string;
        title: string;
        year: number;
    }>;
};
export interface SearchResult {
    id: number;
    type: string;
    user_data: UserData;
    master_id?: number;
    master_url?: string;
    uri: string;
    title: string;
    thumb: string;
    cover_image: string;
    resource_url: string;
    country?: string;
    year?: string;
    format?: string[];
    label?: string[];
    genre?: string[];
    style?: string[];
    barcode?: string[];
    catno?: string;
    community?: Community;
    format_quantity?: number;
    formats?: Format[];
}

export interface UserData {
    in_wantlist: boolean;
    in_collection: boolean;
}

export interface Community {
    want: number;
    have: number;
}

export interface Format {
    name: string;
    qty: string;
    descriptions?: string[];
}

export type SearchResponse = {
    results: Array<SearchResult>;
};
export type SearchParameters = {
    query: string;
    type: 'release' | 'master' | 'artist' | 'label';
    title: string;
    release_title: string;
    credit: string;
    artist: string;
    anv: string;
    label: string;
    genre: string;
    style: string;
    country: string;
    year: string;
    format: string;
    catno: string;
    barcode: string;
    track: string;
    submitter: string;
    contributor: string;
};

/**
 * @param {DiscogsClient} client
 * @see https://www.discogs.com/developers/#page:database
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Expose Discogs database status constants
         * @deprecated Use the `Status` enum instead
         */
        status: { accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected' },

        /**
         * Get artist data
         * @param {(number|string)} artist - The Discogs artist ID
         * @returns {Promise<RateLimitedResponse<GetArtistResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-artist-get
         *
         * @example
         * await client.database().getArtist(108713);
         */
        getArtist: function (artist: number | string): Promise<RateLimitedResponse<GetArtistResponse>> {
            return client.get('/artists/' + artist) as Promise<RateLimitedResponse<GetArtistResponse>>;
        },

        /**
         * Get artist release data
         * @param {(number|string)} artist - The Discogs artist ID
         * @param {PaginationParameters & SortParameters<'year'|'title'|'format'>} [params] - Optional pagination params
         * @returns {Promise<RateLimitedResponse<GetArtistReleasesResponses & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-artist-releases-get
         *
         * @example
         * await client.database().getArtistReleases(108713, { page: 2, sort: 'year', sort_order: 'asc' });
         */
        getArtistReleases: function (
            artist: number | string,
            params?: PaginationParameters & SortParameters<'year' | 'title' | 'format'>
        ): Promise<RateLimitedResponse<GetArtistReleasesResponses & PaginationResponse>> {
            const path = `/artists/${artist}/releases${toQueryString(params)}`;
            return client.get(path) as Promise<RateLimitedResponse<GetArtistReleasesResponses & PaginationResponse>>;
        },

        /**
         * Get release data
         * @param {(number|string)} release - The Discogs release ID
         * @param {Currency} [currency] - Currency for marketplace data. Defaults to the authenticated users currency.
         * @returns {Promise<RateLimitedResponse<GetReleaseResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-release-get
         *
         * @example
         * await client.database().getRelease(249504);
         *
         * @example
         * await client.database().getRelease(249504, 'USD');
         */
        getRelease: function (
            release: number | string,
            currency?: Currency
        ): Promise<RateLimitedResponse<GetReleaseResponse>> {
            let path = `/releases/${release}`;
            if (currency !== undefined) {
                path += `${toQueryString({ curr_abbr: currency })}`;
            }
            return client.get(path) as Promise<RateLimitedResponse<GetReleaseResponse>>;
        },

        /**
         * Get the release rating for the given user
         * @param {(number|string)} release - The Discogs release ID
         * @param {string} user - The Discogs user name
         * @returns {Promise<RateLimitedResponse<GetReleaseRatingResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-release-rating-by-user-get
         *
         * @example
         * await client.database().getReleaseRating(249504, 'rodneyfool');
         */
        getReleaseRating: function (
            release: number | string,
            user: string
        ): Promise<RateLimitedResponse<GetReleaseRatingResponse>> {
            return client.get(`/releases/${release}/rating/${escape(user)}`) as Promise<
                RateLimitedResponse<GetReleaseRatingResponse>
            >;
        },

        /**
         * Set (or remove) a release rating for the given logged in user
         * @param {(number|string)} release - The Discogs release ID
         * @param {string} user - The Discogs user name
         * @param {1 | 2 | 3 | 4 | 5 | null} rating - The new rating for a release between 1 and 5. Null = remove rating
         * @returns {Promise<RateLimitedResponse<GetReleaseRatingResponse | void>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-release-rating-by-user-put
         * @see https://www.discogs.com/developers/#page:database,header:database-release-rating-by-user-delete
         *
         * @example
         * await client.database().setReleaseRating(249504, 'rodneyfool', 2);
         *
         * @example
         * await client.database().setReleaseRating(249504, 'rodneyfool', null);
         */
        setReleaseRating: function (
            release: number | string,
            user: string,
            rating: 1 | 2 | 3 | 4 | 5 | null
        ): Promise<RateLimitedResponse<GetReleaseRatingResponse | void>> {
            const url = `/releases/${release}/rating/${escape(user)}`;
            if (!rating) {
                return client.delete({ url: url, authLevel: 2 }) as Promise<RateLimitedResponse<void>>;
            } else {
                return client.put({ url: url, authLevel: 2 }, { rating: rating > 5 ? 5 : rating }) as Promise<
                    RateLimitedResponse<GetReleaseRatingResponse>
                >;
            }
        },

        /**
         * Get the average rating and the total number of user ratings for a given release.
         * @param {(number|string)} release - The Discogs release ID
         * @returns {Promise<RateLimitedResponse<GetReleaseCommunityRatingResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-community-release-rating-get
         *
         * @example
         * await client.database().getReleaseCommunityRating(249504);
         */
        getReleaseCommunityRating: function (
            release: number | string
        ): Promise<RateLimitedResponse<GetReleaseCommunityRatingResponse>> {
            const path = `/releases/${release}/rating`;
            return client.get(path) as Promise<RateLimitedResponse<GetReleaseCommunityRatingResponse>>;
        },

        /**
         * Get the total number of "haves" (in the community's collections)
         * and "wants" (in the community's wantlists) for a given release.
         * @param {(number|string)} release - The Discogs release ID
         * @returns {Promise<RateLimitedResponse<GetReleaseStatsResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-release-stats-get
         *
         * @example
         * await client.database().getReleaseStats(249504);
         */
        getReleaseStats: function (release: number | string): Promise<RateLimitedResponse<GetReleaseStatsResponse>> {
            const path = `/releases/${release}/stats`;
            return client.get(path) as Promise<RateLimitedResponse<GetReleaseStatsResponse>>;
        },

        /**
         * Get master release data
         * @param {(number|string)} master - The Discogs master release ID
         * @returns {Promise<RateLimitedResponse<GetMasterResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-master-release-get
         *
         * @example
         * await client.database().getMaster(1000);
         */
        getMaster: function (master: number | string): Promise<RateLimitedResponse<GetMasterResponse>> {
            return client.get(`/masters/${master}`) as Promise<RateLimitedResponse<GetMasterResponse>>;
        },

        /**
         * Get the release versions contained in the given master release
         * @param {(number|string)} master - The Discogs master release ID
         * @param {PaginationParameters & Partial<{ format: string; label: string; released: string; country: string } & SortParameters<'released'|'title'|'format'|'label'|'catno'|'country'>>} [params] - optional pagination params
         * @returns {Promise<RateLimitedResponse<GetMasterVersionsResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-master-release-versions-get
         *
         * @example
         * await client.database().getMasterVersions(1000, {
         *     page: 2,
         *     per_page: 25,
         *     format: 'Vinyl',
         *     label: 'Scorpio Music',
         *     released: '1992',
         *     country: 'Belgium',
         *     sort: 'released',
         *     sort_order: 'asc'
         * });
         */
        getMasterVersions: function (
            master: number | string,
            params?: PaginationParameters &
                Partial<
                    { format: string; label: string; released: string; country: string } & SortParameters<
                        'released' | 'title' | 'format' | 'label' | 'catno' | 'country'
                    >
                >
        ): Promise<RateLimitedResponse<GetMasterVersionsResponse & PaginationResponse>> {
            const path = `/masters/${master}/versions${toQueryString(params)}`;
            return client.get(path) as Promise<RateLimitedResponse<GetMasterVersionsResponse & PaginationResponse>>;
        },

        /**
         * Get label data
         * @param {(number|string)} label - The Discogs label ID
         * @returns {Promise<RateLimitedResponse<GetLabelResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-label-get
         *
         * @example
         * await client.database().getLabel(1)
         */
        getLabel: function (label: number | string): Promise<RateLimitedResponse<GetLabelResponse>> {
            return client.get(`/labels/${label}`) as Promise<RateLimitedResponse<GetLabelResponse>>;
        },

        /**
         * Get label release data
         * @param {(number|string)} label - The Discogs label ID
         * @param {PaginationParameters} [params] - Optional pagination params
         * @returns {Promise<RateLimitedResponse<GetLabelReleasesResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-all-label-releases-get
         *
         * @example
         * await client.database().getLabelReleases(1, { page: 3, per_page: 25 });
         */
        getLabelReleases: function (
            label: number | string,
            params?: PaginationParameters
        ): Promise<RateLimitedResponse<GetLabelReleasesResponse & PaginationResponse>> {
            const path = `/labels/${label}/releases${toQueryString(params)}`;
            return client.get(path) as Promise<RateLimitedResponse<GetLabelReleasesResponse & PaginationResponse>>;
        },

        /**
         * Search the database
         * @param {PaginationParameters & Partial<SearchParameters>} [params] - Search parameters
         *
         * @returns {Promise<RateLimitedResponse<SearchResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:database,header:database-search-get
         *
         * @example
         * await client.database().search({
         *     query: 'nirvana', // Your search query
         *     type: 'release', // One of 'release', 'master', 'artist', 'label'
         *     title: 'nirvana - nevermind', // Search by combined “Artist Name - Release Title” title field.
         *     release_title: 'nevermind', // Search release titles.
         *     credit: 'kurt', // Search release credits.
         *     artist: 'nirvana', // Search artist names.
         *     anv: 'nirvana', // Search artist ANV.
         *     label: 'dgc', // Search label names.
         *     genre: 'rock', // Search genres.
         *     style: 'grunge', // Search styles.
         *     country: 'canada', // Search release country.
         *     year: '1991', // Search release year.
         *     format: 'album', // Search formats.
         *     catno: 'DGCD-24425', // Search catalog number.
         *     barcode: '7 2064-24425-2 4', // Search barcodes.
         *     track: 'smells like teen spirit', // Search track titles.
         *     submitter: 'milKt', // Search submitter username.
         *     contributor: 'jerome99', // Search contributor usernames.
         * });
         */
        search: function (
            params: PaginationParameters & Partial<SearchParameters> = {}
        ): Promise<RateLimitedResponse<SearchResponse & PaginationResponse>> {
            const { query, ...inputArgs } = params;
            const args = query ? Object.assign(inputArgs, { q: query }) : inputArgs;
            return client.get({ url: `/database/search${toQueryString(args)}`, authLevel: 1 }) as Promise<
                RateLimitedResponse<SearchResponse & PaginationResponse>
            >;
        },
    };
}
