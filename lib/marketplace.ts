import { type DiscogsClient } from './client.js';
import {
    type RateLimitedResponse,
    type SortParameters,
    type Currency,
    type PaginationParameters,
    type PaginationResponse,
    type Price,
    type Listing,
    type SaleStatus,
} from './types.js';
import user from './user.js';
import { toQueryString } from './util.js';

type Condition =
    | 'Mint (M)'
    | 'Near Mint (NM or M-)'
    | 'Very Good Plus (VG+)'
    | 'Very Good (VG)'
    | 'Good Plus (G+)'
    | 'Good (G)'
    | 'Fair (F)'
    | 'Poor (P)';
type SleeveCondition = Condition | 'Generic' | 'Not Graded' | 'No Cover';
type OrderStatus =
    | 'New Order'
    | 'Buyer Contacted'
    | 'Invoice Sent'
    | 'Payment Pending'
    | 'Payment Received'
    | 'Shipped'
    | 'Refund Sent'
    | 'Cancelled (Non-Paying Buyer)'
    | 'Cancelled (Item Unavailable)'
    | "Cancelled (Per Buyer's Request)";
type Order = { resource_url: string; id: number };
type OrderMessage = {
    timestamp: string;
    message: string;
    type: string;
    order: Order;
    subject: string;
    refund?: { amount: number; order: Order };
    from?: { id: number; username: string; avatar_url: string; resource_url: string };
    status_id?: number;
    actor?: { username: string; resource_url: string };
    original?: number;
    new?: number;
};
type AddListingResponse = { listing_id: number; resource_url: string };
type GetOrderResponse = {
    id: number;
    resource_url: string;
    messages_url: string;
    uri: string;
    status: OrderStatus;
    next_status: Array<OrderStatus>;
    fee: Price;
    created: string;
    items: Array<{
        release: { id: number; description: string };
        price: Price;
        media_condition: Condition;
        sleeve_condition: SleeveCondition;
        id: number;
    }>;
    shipping: { currency: Currency; method: string; value: number };
    shipping_address: string;
    additional_instructions: string;
    archived: boolean;
    seller: { resource_url: string; username: string; id: number };
    last_activity: string;
    buyer: { resource_url: string; username: string; id: number };
    total: Price;
};
type GetReleaseStatsResponse = { lowest_price?: Price; num_for_sale?: number; blocked_from_sale: boolean };

/**
 * @param {DiscogsClient} client
 */
export default function (client: DiscogsClient) {
    return {
        /**
         * Copy the getInventory function from the user module
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-inventory-get
         */
        getInventory: user(client).getInventory,

        /**
         * Get a marketplace listing
         * @param {number} listing - The listing ID
         * @param {Currency} [currency] - Optional currency
         * @returns {Promise<RateLimitedResponse<Listing>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-listing-get
         *
         * @example
         * await client.marketplace().getListing(172723812, 'USD');
         */
        getListing: function (listing: number, currency?: Currency): Promise<RateLimitedResponse<Listing>> {
            let path = `/marketplace/listings/${listing}`;
            if (currency !== undefined) {
                path += `?${toQueryString({ curr_abbr: currency })}`;
            }
            return client.get(path) as Promise<RateLimitedResponse<Listing>>;
        },

        /**
         * Create a marketplace listing
         * @param {{release_id: number; condition: Condition; price: number; status: SaleStatus;} & Partial<{sleeve_condition: SleeveCondition; comments: string; allow_offers: boolean; external_id: string; location: string; weight: number | 'auto'; format_quantity: number | 'auto'}>} data - The data for the listing
         * @returns {Promise<RateLimitedResponse<AddListingResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-new-listing-post
         *
         * @example
         * await client.marketplace().addListing({
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
        addListing: function (
            data: { release_id: number; condition: Condition; price: number; status: SaleStatus } & Partial<{
                sleeve_condition: SleeveCondition;
                comments: string;
                allow_offers: boolean;
                external_id: string;
                location: string;
                weight: number | 'auto';
                format_quantity: number | 'auto';
            }>
        ): Promise<RateLimitedResponse<AddListingResponse>> {
            return client.post({ url: '/marketplace/listings', authLevel: 2 }, data) as Promise<
                RateLimitedResponse<AddListingResponse>
            >;
        },

        /**
         * Edit a marketplace listing
         * @param {number} listing - The listing ID
         * @param {{release_id: number; condition: Condition; price: number; status: SaleStatus} & Partial<{sleeve_condition: SleeveCondition; comments: string; allow_offers: boolean; external_id: string; location: string; weight: number | 'auto'; format_quantity: number | 'auto'}>} data - The data for the listing
         * @returns {Promise<RateLimitedResponse<void>>}
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
        editListing: function (
            listing: number,
            data: { release_id: number; condition: Condition; price: number; status: SaleStatus } & Partial<{
                sleeve_condition: SleeveCondition;
                comments: string;
                allow_offers: boolean;
                external_id: string;
                location: string;
                weight: number | 'auto';
                format_quantity: number | 'auto';
            }>
        ): Promise<RateLimitedResponse<void>> {
            return client.post({ url: `/marketplace/listings/${listing}`, authLevel: 2 }, data) as Promise<
                RateLimitedResponse<void>
            >;
        },

        /**
         * Delete a marketplace listing
         * @param {number} listing - The listing ID
         * @returns {Promise<RateLimitedResponse<void>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-listing-delete
         *
         * @example
         * await client.marketplace().deleteListing(172723812);
         */
        deleteListing: function (listing: number): Promise<RateLimitedResponse<void>> {
            return client.delete({ url: `/marketplace/listings/${listing}`, authLevel: 2 }) as Promise<
                RateLimitedResponse<void>
            >;
        },

        /**
         * Get a list of the authenticated user's orders
         * @param {Partial<{status: OrderStatus; created_after: string; created_before: string; archived: boolean}> & PaginationParameters & SortParameters<'id' | 'buyer' | 'created' | 'status' | 'last_activity'>} [params] - Optional sorting and pagination params
         * @returns {Promise<RateLimitedResponse<PaginationResponse & {orders: Array<GetOrderResponse>}>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-list-orders-get
         *
         * @example
         * await client.marketplace().getOrders({
         *     status: "Cancelled (Per Buyer's Request)",
         *     created_after: '2019-06-24T20:58:58Z',
         *     created_before: '2019-06-25T20:58:58Z',
         *     archived: true,
         *     sort: 'last_activity',
         *     sort_order: 'desc',
         *     page: 2,
         *     per_page: 50,
         * });
         */
        getOrders: function (
            params?: Partial<{
                status: OrderStatus;
                created_after: string;
                created_before: string;
                archived: boolean;
            }> &
                PaginationParameters &
                SortParameters<'id' | 'buyer' | 'created' | 'status' | 'last_activity'>
        ): Promise<RateLimitedResponse<PaginationResponse & { orders: Array<GetOrderResponse> }>> {
            const path = `/marketplace/orders?${toQueryString(params)}`;
            return client.get({ url: path, authLevel: 2 }) as Promise<
                RateLimitedResponse<PaginationResponse & { orders: Array<GetOrderResponse> }>
            >;
        },

        /**
         * Get details of a marketplace order
         * @param {number} order - The order ID
         * @returns {Promise<RateLimitedResponse<GetOrderResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-order-get
         *
         * @example
         * await client.marketplace().getOrder(1);
         */
        getOrder: function (order: number): Promise<RateLimitedResponse<GetOrderResponse>> {
            return client.get({ url: `/marketplace/orders/${order}`, authLevel: 2 }) as Promise<
                RateLimitedResponse<GetOrderResponse>
            >;
        },

        /**
         * Edit a marketplace order
         * @param {number} order - The order ID
         * @param {Partial<{status: OrderStatus; shipping: number}>} data - The data for the order
         * @returns {Promise<RateLimitedResponse<GetOrderResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-order-post
         *
         * @example
         * await client.marketplace().editOrder(1, { status: 'Shipped', shipping: 10 });
         */
        editOrder: function (
            order: number,
            data: Partial<{ status: OrderStatus; shipping: number }>
        ): Promise<RateLimitedResponse<GetOrderResponse>> {
            return client.post({ url: `/marketplace/orders/${order}`, authLevel: 2 }, data) as Promise<
                RateLimitedResponse<GetOrderResponse>
            >;
        },

        /**
         * List the messages for the given order ID
         * @param {number} order - The order ID
         * @param {PaginationParameters} [params] - Optional pagination parameters
         * @returns {Promise<RateLimitedResponse<PaginationResponse & {messages: Array<OrderMessage>}>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-list-order-messages-get
         *
         * @example
         * await client.marketplace().getOrderMessages(1, { page: 2, per_page: 50 });
         */
        getOrderMessages: function (
            order: number,
            params?: PaginationParameters
        ): Promise<RateLimitedResponse<PaginationResponse & { messages: Array<OrderMessage> }>> {
            const path = `/marketplace/orders/${order}/messages?${toQueryString(params)}`;
            return client.get({ url: path, authLevel: 2 }) as Promise<
                RateLimitedResponse<PaginationResponse & { messages: Array<OrderMessage> }>
            >;
        },

        /**
         * Add a message to the given order ID
         * @param {number} order - The order ID
         * @param {Partial<{message: string; status: OrderStatus}>} data - The message data
         * @returns {Promise<RateLimitedResponse<OrderMessage>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-list-order-messages-post
         *
         * @example
         * await client.marketplace().addOrderMessage(1, { message: 'hello world', status: 'New Order' });
         */
        addOrderMessage: function (
            order: number,
            data: Partial<{ message: string; status: OrderStatus }>
        ): Promise<RateLimitedResponse<OrderMessage>> {
            return client.post({ url: '/marketplace/orders/' + order + '/messages', authLevel: 2 }, data) as Promise<
                RateLimitedResponse<OrderMessage>
            >;
        },

        /**
         * Get the marketplace fee for a given price
         * @param {number} price - The price as a number
         * @param {Currency} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
         * @returns {Promise<RateLimitedResponse<Price>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-fee-get
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-fee-with-currency-get
         *
         * @example
         * await client.marketplace().getFee(10);
         * await client.marketplace().getFee(10, 'EUR');
         */
        getFee: function (price: number, currency?: Currency): Promise<RateLimitedResponse<Price>> {
            let path = `/marketplace/fee/${price.toFixed(2)}`;
            if (currency) {
                // Get the fee in a given currency
                path += '/' + currency;
            }
            return client.get(path) as Promise<RateLimitedResponse<Price>>;
        },

        /**
         * Get price suggestions for a given release ID in the user's selling currency
         * @param {number} release - The release ID
         * @returns {Promise<RateLimitedResponse<Record<Condition, Price>>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-price-suggestions-get
         *
         * @example
         * await client.marketplace().getPriceSuggestions(10);
         */
        getPriceSuggestions: function (release: number): Promise<RateLimitedResponse<Record<Condition, Price>>> {
            return client.get({ url: `/marketplace/price_suggestions/${release}`, authLevel: 2 }) as Promise<
                RateLimitedResponse<Record<Condition, Price>>
            >;
        },

        /**
         * Retrieve marketplace statistics for the provided Release ID.
         * These statistics reflect the state of the release in the marketplace currently,
         * and include the number of items currently for sale, lowest listed price of any item for sale,
         * and whether the item is blocked for sale in the marketplace.
         * @param {number} release
         * @param {Currency} [currency]
         * @returns {Promise<RateLimitedResponse<GetReleaseStatsResponse>>}
         *
         * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-release-statistics-get
         *
         * @example
         * await client.marketplace().getReleaseStats(1, 'EUR');
         */
        getReleaseStats: function (
            release: number,
            currency?: Currency
        ): Promise<RateLimitedResponse<GetReleaseStatsResponse>> {
            let path = `/marketplace/stats/${release}`;
            if (currency) {
                path += `?${toQueryString({ curr_abbr: currency })}`;
            }
            return client.get({ url: path }) as Promise<RateLimitedResponse<GetReleaseStatsResponse>>;
        },
    };
}
