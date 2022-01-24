import type { Client } from '../client';
import type { BaseBookOptions } from '../typings';

/**
 * The base class for all books
 */
export class BaseBook {
	/**
	 * The instance of {@link Client} that was used to log in
	 */
	client: Client;

	/**
	 * The token for fetching next page
	 * @internal
	 */
	_nextToken?: string;

	/**
	 * The token for fetching previous page
	 * @internal
	 */
	_previousToken?: string;

	/**
	 * Whether an initial request for fetching the first page has already been made
	 *
	 * **Note**: Use this to not throw `PAGINATED_RESPONSE_TAIL_REACHED` error for initial page request in {@link ComposedTweetsBook.fetchNextPage}
	 * @internal
	 */
	_hasMadeInitialRequest?: boolean;

	/**
	 * The maximum amount of tweets that will be fetched per page.
	 *
	 * **Note:** This is the max count and will **not** always be equal to the number of tweets fetched in a page
	 */
	maxResultsPerPage: number | null;

	/**
	 * Whether there are more pages of tweets to be fetched
	 *
	 * **Note:** Use this as a check for deciding whether to fetch more pages
	 */
	hasMore: boolean;

	/**
	 * @param client The logged in {@link Client} instance
	 */
	constructor(client: Client, options?: BaseBookOptions) {
		Object.defineProperty(this, 'client', { writable: true, enumerable: false });
		this.client = client;
		this.hasMore = true;
		this.maxResultsPerPage = options?.maxResultsPerPage ?? null;
	}
}
