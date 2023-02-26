import { type DiscogsClient } from './client.js';
import { type PaginationParameters, type PaginationResponse, type RateLimitedResponse } from './types.js';
import { toQueryString } from './util.js';

type GetInventoryExportsResponse = {
    items: Array<GetInventoryExportResponse>;
};
type GetInventoryExportResponse = {
    status: string;
    created_ts: string;
    url: string;
    finished_ts: string;
    download_url: string;
    filename: string;
    id: number;
};

/**
 * @param {DiscogsClient} client
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Request an export of your inventory as a CSV.
         * Note: this method only requests the export and doesn't return the CSV yet.
         *
         * @returns {Promise<RateLimitedResponse<void>>}
         *
         * @see https://www.discogs.com/developers#page:inventory-export,header:inventory-export-export-your-inventory-post
         *
         * @example
         * await discogs.inventory().exportInventory();
         */
        exportInventory: function (): Promise<RateLimitedResponse<void>> {
            return client.post('/inventory/export', {}) as Promise<RateLimitedResponse<void>>;
        },

        /**
         * Get a list of all recent exports of your inventory.
         *
         * @param {PaginationParameters} params
         * @returns {Promise<RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers#page:inventory-export,header:inventory-export-get-recent-exports-get
         *
         * @example
         * await discogs.inventory().getExports();
         */
        getExports: function (
            params: PaginationParameters
        ): Promise<RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>> {
            return client.get(`/inventory/export${toQueryString(params)}`) as Promise<
                RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>
            >;
        },
    };
}
