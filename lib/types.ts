export type RateLimitedResponse<ResponseData> = { data: ResponseData; rateLimit: RateLimit };
export type ClientConfig = {
    host: string;
    port: number;
    userAgent: string;
    apiVersion: string;
    outputFormat: 'discogs' | 'plaintext' | 'html';
    requestLimit: number;
    requestLimitAuth: number;
    requestLimitInterval: number;
};
export type Auth = {
    method: 'discogs' | 'oauth';
    level: number;
    consumerKey: string;
    consumerSecret: string;
    userToken: string;
    accessToken: string;
    accessTokenSecret: string;
};
export type RateLimit = { limit: number; used: number; remaining: number };
export type RequestCallback = (err?: Error, data?: unknown, rateLimit?: RateLimit) => any;
export type RequestOptions = {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: Record<string, any>;
    queue?: boolean;
    json?: boolean;
    authLevel?: number;
};
export type PaginationResponse = {
    pagination: {
        per_page: number;
        pages: number;
        page: number;
        items: number;
        urls: { next: string; last: string; first?: string; prev?: string };
    };
};
export type GetIdentityResponse = { id: number; username: string; resource_url: string; consumer_name: string };
/**
 * Some resources represent collections of objects and may be paginated. By default, 50 items per page are shown.
 * To browse different pages, or change the number of items per page (up to 100), use the page and per_page parameters
 */
export type PaginationParameters = Partial<{ page: number; per_page: number }>;
export type SortOrder = 'asc' | 'desc';
export type Seller = { username: string; resource_url: string; id: number };
export type Release = {
    catalog_number: string;
    resource_url: string;
    year: number;
    id: number;
    description: string;
    images: Array<Image>;
    artist: string;
    title: string;
    format: string;
    thumbnail: string;
    stats: {
        community: { in_wantlist: number; in_collection: number };
        user?: { in_wantlist: number; in_collection: number };
    };
};
export type Listing = {
    weight?: string;
    format_quantity?: number;
    external_id?: number;
    location?: string;
    in_cart?: boolean;
    status: string;
    price: Price;
    original_price: OriginalPrice;
    shipping_price: Price;
    original_shipping_price: Price;
    allow_offers: boolean;
    sleeve_condition: string;
    id: number;
    condition: string;
    posted: string;
    ships_from: string;
    uri: string;
    comments: string;
    seller: Seller;
    release: Release;
    resource_url: string;
    audio: boolean;
};
export type Price = { currency: Currency; value: number };
export type OriginalPrice = { curr_abbr: Currency; curr_id: number; formatted: string; value: number };
export type Label = {
    id: number;
    name: string;
    resource_url: string;
    uri: string;
    releases_url: string;
    images?: Array<Image>;
    contactinfo?: string;
    profile: string;
    data_quality: string;
    sublabels?: Array<string>;
    parentLabel?: string;
    urls?: Array<string>;
};
export type LabelShort = { resource_url: string; entity_type: string; catno: string; id: number; name: string };
export type Currency = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'MXN' | 'BRL' | 'NZD' | 'SEK' | 'ZAR';
export type SortParameters<K> = Partial<{ sort: K; sort_order: SortOrder }>;
export type GetReleaseResponse = {
    title: string;
    id: number;
    artists: Array<Artist>;
    data_quality: string;
    thumb: string;
    community: Array<{
        contributors: Array<{ resource_url: string; username: string }>;
        data_quality: string;
        have: number;
        rating: { average: number; count: number };
        status: string;
        submitter: { resource_url: string; username: string };
        want: number;
    }>;
    companies: Array<{
        catno: string;
        entity_type: string;
        entity_type_name: string;
        id: number;
        name: string;
        resource_url: string;
    }>;
    country: string;
    date_added: string;
    date_changed: string;
    estimated_weight: number;
    extraartists: Array<Artist>;
    format_quantity: number;
    formats: Array<{ descriptions: Array<string>; name: string; qty: string }>;
    genres: Array<string>;
    identifiers: Array<{ type: string; value: string }>;
    images: Array<Image>;
    labels: Array<{ catno: string; entity_type: string; id: number; name: string; resource_url: string }>;
    lowest_price: number;
    master_id: number;
    master_url: string;
    notes: string;
    num_for_sale: number;
    released: string;
    released_formatted: string;
    resource_url: string;
    series: Array<{
        name: string;
        catno: string;
        entity_type: string;
        entity_type_name: string;
        id: number;
        resource_url: string;
        thumbnail_url: string;
    }>;
    status: string;
    styles: Array<string>;
    tracklist: Array<Tracklisting>;
    uri: string;
    videos: Array<{ description: string; duration: number; embed: boolean; title: string; uri: string }>;
    year: number;
};
export type Image = {
    width: number;
    height: number;
    resource_url: string;
    type: string;
    uri: string;
    uri150: string;
};
export type Artist = {
    anv: string;
    id: number;
    join: string;
    name: string;
    resource_url: string;
    role: string;
    tracks: string;
};
export type Tracklisting = {
    duration: string;
    position: string;
    title: string;
    type_: string;
    extraartists?: Array<Artist>;
};
