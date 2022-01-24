import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type User } from '../structures';
import type { Client } from '../client';
import type { LikedByUsersBookOptions } from '../typings';
import type { GETTweetsIdLikingUsersQuery, GETTweetsIdLikingUsersResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching users who liked a tweet
 */
export class LikedByUsersBook extends BaseBook {
	/**
	 * The Id of the tweet this book belongs to
	 */
	tweetId: Snowflake;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: LikedByUsersBookOptions) {
		super(client, options);
		const tweetId = client.tweets.resolveId(options.tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID');
		this.tweetId = tweetId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link User} who liked the given tweet
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
	 * @returns A {@link Collection} of {@link User} who liked the given tweet
	 */
	async fetchPreviousPage(): Promise<Collection<Snowflake, User>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<Snowflake, User>> {
		const likingUsers = new Collection<Snowflake, User>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETTweetsIdLikingUsersQuery = {
			expansions: queryParameters?.userExpansions,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			pagination_token: token,
			max_results: this.maxResultsPerPage ?? undefined,
		};
		const requestData = new RequestData({ query });
		const data: GETTweetsIdLikingUsersResponse = await this.client._api
			.tweets(this.tweetId)
			.liking_users.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return likingUsers;
		const rawUsers = data.data;
		const rawIncludes = data.includes;
		for (const rawUser of rawUsers) {
			const user = this.client.users._add(rawUser.id, { data: rawUser, includes: rawIncludes }, false);
			likingUsers.set(user.id, user);
		}
		return likingUsers;
	}
}
