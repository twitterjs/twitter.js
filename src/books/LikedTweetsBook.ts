import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type Tweet } from '../structures';
import type { Client } from '../client';
import type { LikedTweetsBookOptions } from '../typings';
import type { GETUsersIdLikedTweetsQuery, GETUsersIdLikedTweetsResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching tweets liked by a twitter user
 */
export class LikedTweetsBook extends BaseBook {
	/**
	 * The Id of the user this book belongs to
	 */
	userId: Snowflake;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: LikedTweetsBookOptions) {
		super(client, options);
		const userId = client.users.resolveId(options.user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'create LikedTweetsBook for');
		this.userId = userId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweet} liked by the given user
	 */
	async fetchNextPage(): Promise<Collection<Snowflake, Tweet>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	/**
	 * Fetches the previous page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweet} liked by the given user
	 */
	async fetchPreviousPage(): Promise<Collection<Snowflake, Tweet>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<Snowflake, Tweet>> {
		const likedTweets = new Collection<Snowflake, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETUsersIdLikedTweetsQuery = {
			expansions: queryParameters?.tweetExpansions,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			pagination_token: token,
		};
		if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
		const requestData = new RequestData({ query });
		const data: GETUsersIdLikedTweetsResponse = await this.client._api.users(this.userId).liked_tweets.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return likedTweets;
		const rawTweets = data.data;
		const rawIncludes = data.includes;
		for (const rawTweet of rawTweets) {
			const tweet = this.client.tweets._add(rawTweet.id, { data: rawTweet, includes: rawIncludes }, false);
			likedTweets.set(tweet.id, tweet);
		}
		return likedTweets;
	}
}
