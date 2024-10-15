import { escape, toQueryString } from './util.js';
import { AuthError } from './error.js';
import type {
    SortParameters} from './types.js';
import {
    type RateLimitedResponse,
    type PaginationParameters,
    type PaginationResponse
} from './types.js';
import { type DiscogsClient } from './client.js';

export type BasicReleaseInfo = {
    id: number;
    title: string;
    year: number;
    resource_url: string;
    thumb: string;
    cover_image: string;
    formats: Array<{ qty: string; descriptions: Array<string>; name: string }>;
    labels: Array<{ resource_url: string; entity_type: string; catno: string; id: number; name: string }>;
    artists: Array<{
        id: number;
        name: string;
        join: string;
        resource_url: string;
        anv: string;
        tracks: string;
        role: string;
    }>;
    genres: Array<string>;
    styles: Array<string>;
};
export type GetFoldersResponse = { folders: Array<GetFolderResponse> };
export type GetFolderResponse = { id: number; count: number; name: string; resource_url: string };
export type GetReleasesResponse = {
    releases: Array<{
        id: number;
        instance_id: number;
        folder_id: number;
        rating: number;
        basic_information: BasicReleaseInfo;
        notes: Array<{ field_id: number; value: string }>;
    }>;
};
export type GetReleaseInstancesResponse = {
    releases: Array<{
        id: number;
        instance_id: number;
        folder_id: number;
        rating: number;
        basic_information: BasicReleaseInfo;
        date_added: string;
    }>;
};
export type AddReleaseResponse = { instance_id: number; resource_url: string };
export type GetFieldsResponse = {
    fields: Array<{
        name: string;
        type: string;
        public: boolean;
        position: number;
        id: number;
        options?: Array<string>;
        lines?: number;
    }>;
};
export type CollectionValueResponse = { maximum: string; median: string; minimum: string };

/**
 * @param {DiscogsClient} client
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Get a list of all collection folders for the given user
         * @param {string} user - The user name
         * @returns {Promise<RateLimitedResponse<GetFoldersResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-get
         *
         * @example
         * await client.user().collection().getFolders('rodneyfool');
         */
        getFolders: function (user: string): Promise<RateLimitedResponse<GetFoldersResponse>> {
            return client.get(`/users/${escape(user)}/collection/folders`) as Promise<
                RateLimitedResponse<GetFoldersResponse>
            >;
        },

        /**
         * Get metadata for a specified collection folder
         * @param {string} user - The Discogs user name
         * @param {number | string} folder - A folder ID (0 = public folder)
         * @returns {Promise<RateLimitedResponse<GetFolderResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-folder-get
         *
         * @example
         * await client.user().collection().getFolder('rodneyfool', 3);
         */
        getFolder: function (user: string, folder: number | string): Promise<RateLimitedResponse<GetFolderResponse>> {
            if (client.authenticated(2) || Number(folder) === 0) {
                return client.get(`/users/${escape(user)}/collection/folders/${folder}`) as Promise<
                    RateLimitedResponse<GetFolderResponse>
                >;
            }

            return Promise.reject(new AuthError());
        },

        /**
         * Add a new collection folder
         * @param {string} user - The user name
         * @param {string} name - The folder name
         * @returns {Promise<RateLimitedResponse<GetFolderResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-post
         *
         * @example
         * await client.user().collection().addFolder('rodneyfool', 'My favorites');
         */
        addFolder: function (user: string, name: string): Promise<RateLimitedResponse<GetFolderResponse>> {
            return client.post(
                { url: `/users/${escape(user)}/collection/folders`, authLevel: 2 },
                { name: name }
            ) as Promise<RateLimitedResponse<GetFolderResponse>>;
        },

        /**
         * Change a folder name. The name of folder 0 and 1 can't be changed.
         * @param {string} user - The user name
         * @param {(number|string)}	folder - The folder ID
         * @param {string} name - The new folder name
         * @returns {Promise<RateLimitedResponse<GetFolderResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-folder-post
         *
         * @example
         * await client.user().collection().setFolderName('rodneyfool', 3, 'New Name');
         */
        setFolderName: function (
            user: string,
            folder: number | string,
            name: string
        ): Promise<RateLimitedResponse<GetFolderResponse>> {
            return client.post(
                { url: `/users/${escape(user)}/collection/folders/${folder}`, authLevel: 2 },
                { name: name }
            ) as Promise<RateLimitedResponse<GetFolderResponse>>;
        },

        /**
         * Delete a folder. A folder must be empty before it can be deleted.
         * @param {string} user - The user name
         * @param {(number|string)}	folder - The folder ID
         * @returns {Promise<RateLimitedResponse<void>>>}
         *
         * @example
         * await client.user().collection().deleteFolder('rodneyfool', 3);
         */
        deleteFolder: function (user: string, folder: number | string): Promise<RateLimitedResponse<void>> {
            return client.delete({
                url: `/users/${escape(user)}/collection/folders/${folder}`,
                authLevel: 2,
            }) as Promise<RateLimitedResponse<void>>;
        },

        /**
         * Get the releases in a user's collection folder (0 = public folder)
         * @param {string} user - The user name
         * @param {(number|string)} folder - The folder ID
         * @param {PaginationParameters & SortParameters<'label'|'artist'|'title'|'catno'|'format'|'rating'|'added'|'year'>} [params] - Optional extra pagination and sorting params
         * @returns {Promise<RateLimitedResponse<GetReleasesResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-items-by-folder-get
         *
         * @example
         * await client.user().collection().getReleases('rodneyfool', 3, { sort: 'artist', sort_order: 'desc' });
         */
        getReleases: function (
            user: string,
            folder: number | string,
            params?: PaginationParameters &
                SortParameters<'label' | 'artist' | 'title' | 'catno' | 'format' | 'rating' | 'added' | 'year'>
        ): Promise<RateLimitedResponse<GetReleasesResponse & PaginationResponse>> {
            if (client.authenticated(2) || Number(folder) === 0) {
                const path = `/users/${escape(user)}/collection/folders/${folder}/releases${toQueryString(params)}`;
                return client.get(path) as Promise<RateLimitedResponse<GetReleasesResponse & PaginationResponse>>;
            }
            return Promise.reject(new AuthError());
        },

        /**
         * Get the instances of a release in a user's collection
         * @param {string} user - The user name
         * @param {(number|string)} release - The release ID
         * @returns {Promise<RateLimitedResponse<GetReleaseInstancesResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-items-by-release-get
         *
         * @example
         * await client.user().collection().getReleaseInstances('susan.salkeld', 7781525);
         */
        getReleaseInstances: function (
            user: string,
            release: number | string
        ): Promise<RateLimitedResponse<GetReleaseInstancesResponse & PaginationResponse>> {
            return client.get(`/users/${escape(user)}/collection/releases/${release}`) as Promise<
                RateLimitedResponse<GetReleaseInstancesResponse & PaginationResponse>
            >;
        },

        /**
         * Add a release instance to the (optionally) given collection folder
         * @param {string} user - The user name
         * @param {(number|string)} release - The release ID
         * @param {(number|string)} [folder] - The folder ID (defaults to the "Uncategorized" folder)
         * @returns {Promise<RateLimitedResponse<AddReleaseResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-add-to-collection-folder-post
         *
         * @example
         * await client.user().collection().addRelease('rodneyfool', 130076, 3);
         */
        addRelease: function (
            user: string,
            release: number | string,
            folder: number | string = 1
        ): Promise<RateLimitedResponse<AddReleaseResponse>> {
            return client.post(
                { url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}`, authLevel: 2 },
                undefined
            ) as Promise<RateLimitedResponse<AddReleaseResponse>>;
        },

        /**
         * Edit a release instance in the given collection folder
         * @param {string} user - The user name
         * @param {(number|string)} folder - The folder ID
         * @param {(number|string)} release - The release ID
         * @param {(number|string)} instance - The release instance ID
         * @param {Partial<{ rating: 1 | 2 | 3 | 4 | 5 | null; folder_id: number }>} data - The instance data
         * @returns {Promise<RateLimitedResponse<void>>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-change-rating-of-release-post
         *
         * @example
         * await client.user().collection().editRelease('rodneyfool', 4, 130076, 1, { rating: 5, folder_id: 16 });
         */
        editRelease: function (
            user: string,
            folder: number | string,
            release: number | string,
            instance: number | string,
            data: Partial<{ rating: 1 | 2 | 3 | 4 | 5 | null; folder_id: number }>
        ): Promise<RateLimitedResponse<void>> {
            return client.post(
                {
                    url: `/users/${escape(
                        user
                    )}/collection/folders/${folder}/releases/${release}/instances/${instance}`,
                    authLevel: 2,
                },
                data
            ) as Promise<RateLimitedResponse<void>>;
        },

        /**
         * Remove an instance of a release from a user's collection folder.
         * @param {string} user - The user name
         * @param {(number|string)} folder - The folder ID
         * @param {(number|string)} release - The release ID
         * @param {(number|string)} instance - The release instance ID
         * @returns {Promise<RateLimitedResponse<void>>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-delete-instance-from-folder-delete
         *
         * @example
         * await client.user().collection().removeRelease('rodneyfool', 3, 130076, 1);
         */
        removeRelease: function (
            user: string,
            folder: number | string,
            release: number | string,
            instance: number | string
        ): Promise<RateLimitedResponse<void>> {
            return client.delete({
                url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}/instances/${instance}`,
                authLevel: 2,
            }) as Promise<RateLimitedResponse<void>>;
        },

        /**
         * Retrieve a list of user-defined collection notes fields.
         * These fields are available on every release in the collection.
         * @param {string} user - The user name
         * @returns {Promise<RateLimitedResponse<GetFieldsResponse>>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-list-custom-fields-get
         *
         * @example
         * await client.user().collection().getFields('rodneyfool');
         */
        getFields: function (user: string): Promise<RateLimitedResponse<GetFieldsResponse>> {
            return client.get(`/users/${escape(user)}/collection/fields`) as Promise<
                RateLimitedResponse<GetFieldsResponse>
            >;
        },

        /**
         * Change the value of a notes field on a particular instance.
         * @param {string} user - The user name
         * @param {(number|string)} folder - The folder ID
         * @param {(number|string)} release - The release ID
         * @param {(number|string)} instance - The release instance ID
         * @param {number} field - The ID of the field
         * @param {string} value - The new value of the field
         * @returns {Promise<RateLimitedResponse<void>>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-edit-fields-instance-post
         *
         * @example
         * await client.user().collection().editInstanceNote('rodneyfool', 3, 130076, 1, 8, 'foo');
         */
        editInstanceNote: function (
            user: string,
            folder: number | string,
            release: number | string,
            instance: number | string,
            field: number,
            value: string
        ): Promise<RateLimitedResponse<void>> {
            const path = `/users/${escape(
                user
            )}/collection/folders/${folder}/releases/${release}/instances/${instance}/fields/${field}?value=${value}`;
            return client.post(path, undefined) as Promise<RateLimitedResponse<void>>;
        },

        /**
         * Returns the minimum, median, and maximum value of a user's collection
         * @param {string} user - The user name
         * @returns {Promise<RateLimitedResponse<CollectionValueResponse>>>}
         *
         * @see https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-value-get
         *
         * @example
         * await client.user().collection().getValue('rodneyfool');
         */
        getValue: function (user: string): Promise<RateLimitedResponse<CollectionValueResponse>> {
            return client.get({ url: `/users/${escape(user)}/collection/value`, authLevel: 2 }) as Promise<
                RateLimitedResponse<CollectionValueResponse>
            >;
        },
    };
}
