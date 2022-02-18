import { type DiscogsClient } from './client.js';
import { RateLimitedResponse } from './types.js';
import { escape } from './util.js';

type GetListItemsResponse = {
    created_ts: string;
    modified_ts: string;
    name: string;
    list_id: number;
    url: string;
    items: Array<{
        comment: string;
        display_title: string;
        uri: string;
        image_url: string;
        resource_url: string;
        type: string;
        id: number;
    }>;
    resource_url: string;
    public: boolean;
    description: string;
};

/**
 * @param {DiscogsClient} client
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Get the items in a list by list ID
         * @param {(number|string)} list - The list ID
         * @returns {Promise<RateLimitedResponse<GetListItemsResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:user-lists,header:user-lists-list-get
         *
         * @example
         * await client.user().list().getItems(123)
         */
        getItems: function (list: number | string): Promise<RateLimitedResponse<GetListItemsResponse>> {
            let path = `/lists/${escape(list.toString())}`;
            // @ts-ignore
            return client.get(path);
        },
    };
}
