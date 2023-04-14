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
            const response = client.post('/inventory/export', {}) as Promise<RateLimitedResponse<unknown>>;
            return response.then(response => ({
                rateLimit: response.rateLimit,
                data: undefined,
            }));
        },

        /**
         * Get a list of all recent exports of your inventory.
         *
         * @param {PaginationParameters} [params]
         * @returns {Promise<RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers#page:inventory-export,header:inventory-export-get-recent-exports-get
         *
         * @example
         * await discogs.inventory().getExports();
         */
        getExports: function (
            params?: PaginationParameters
        ): Promise<RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>> {
            return client.get(`/inventory/export${toQueryString(params)}`) as Promise<
                RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>
            >;
        },

        /**
         * Get details about the status of an inventory export.
         *
         * @param id Id of the export
         * @returns {Promise<RateLimitedResponse<GetInventoryExportsResponse & PaginationResponse>>}
         *
         * @see https://www.discogs.com/developers#page:inventory-export,header:inventory-export-get-an-export-get
         *
         * @example
         * await discogs.inventory().getExport(599632);
         */
        getExport: function (id: number): Promise<RateLimitedResponse<GetInventoryExportResponse>> {
            return client.get(`/inventory/export/${id}`) as Promise<RateLimitedResponse<GetInventoryExportResponse>>;
        },

        /**
         * Get details about the status of an inventory export. Returns the raw Response in `data`,
         * see the example below for further details.
         *
         * @param id Id of the export
         * @returns {Promise<RateLimitedResponse<Response>>}
         *
         * @see https://www.discogs.com/developers#page:inventory-export,header:inventory-export-download-an-export-get
         *
         * @example
         * // Node.js example; download an export, and save it to a file named 'export.csv'
         * import fs from 'fs';
         * import { pipeline } from 'stream/promises';
         *
         * const response = await discogs.inventory().downloadExport(4647524);
         * const writeStream = fs.createWriteStream('export.csv');
         * await pipeline(response.data.body, writeStream);
         */
        downloadExport: function (id: number): Promise<RateLimitedResponse<Response>> {
            return client.get({ url: `/inventory/export/${id}/download`, json: false }) as Promise<
                RateLimitedResponse<Response>
            >;
        },
    };
}
