import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type User } from '../structures';
import type { Client } from '../client';
import type { SpaceTicketBuyersBookOptions } from '../typings';
import type { GETSpacesIdBuyersQuery, GETSpacesIdBuyersResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching users who purchased a ticket for a space
 */
export class SpaceTicketBuyersBook extends BaseBook {
	/**
	 * The Id of the space this book belongs to
	 */
	spaceId: Snowflake;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: SpaceTicketBuyersBookOptions) {
		super(client, options);
		const spaceId = client.spaces.resolveId(options.space);
		if (!spaceId) throw new CustomError('SPACE_RESOLVE_ID');
		this.spaceId = spaceId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link User} who purchased a ticket for the Space
	 */
	async fetchNextPage(): Promise<Collection<Snowflake, User>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	/**
	 * Fetches the previous page of the book if there is one.
	 * @returns A {@link Collection} of {@link User} who purchased a ticket for the Space
	 */
	async fetchPreviousPage(): Promise<Collection<Snowflake, User>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<Snowflake, User>> {
		const buyers = new Collection<Snowflake, User>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesIdBuyersQuery = {
			expansions: queryParameters?.userExpansions,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			pagination_token: token,
		};
		const requestData = new RequestData({ query, isUserContext: true });
		const data: GETSpacesIdBuyersResponse = await this.client._api.spaces(this.spaceId).buyers.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return buyers;
		const rawUsers = data.data;
		const rawIncludes = data.includes;
		for (const rawUser of rawUsers) {
			const user = this.client.users._add(rawUser.id, { data: rawUser, includes: rawIncludes }, false);
			buyers.set(user.id, user);
		}
		return buyers;
	}
}
