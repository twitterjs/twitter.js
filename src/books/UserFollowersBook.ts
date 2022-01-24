import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type User } from '../structures';
import type { Client } from '../client';
import type { UserFollowersBookOptions } from '../typings';
import type { GETUsersIdFollowersQuery, GETUsersIdFollowersResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching followers of a twitter user
 */
export class UserFollowersBook extends BaseBook {
	/**
	 * The Id of the user this book belongs to
	 */
	userId: Snowflake;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the with
	 */
	constructor(client: Client, options: UserFollowersBookOptions) {
		super(client, options);
		const userId = client.users.resolveId(options.user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'create FollowersBook for');
		this.userId = userId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link User} who follow the given user
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
	 * @returns A {@link Collection} of {@link User} who follow the given user
	 */
	async fetchPreviousPage(): Promise<Collection<Snowflake, User>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<Snowflake, User>> {
		const followers = new Collection<Snowflake, User>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETUsersIdFollowersQuery = {
			expansions: queryParameters?.userExpansions,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			pagination_token: token,
		};
		if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
		const requestData = new RequestData({ query });
		const data: GETUsersIdFollowersResponse = await this.client._api.users(this.userId).followers.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return followers;
		const rawUsers = data.data;
		const rawIncludes = data.includes;
		for (const rawUser of rawUsers) {
			const user = this.client.users._add(rawUser.id, { data: rawUser, includes: rawIncludes }, false);
			followers.set(user.id, user);
		}
		return followers;
	}
}
