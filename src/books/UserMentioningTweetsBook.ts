import { Collection } from '../util';
import { CustomError } from '../errors';
import { RequestData, type Tweet } from '../structures';
import { BaseRangeBook, type BaseRangeBookOptions } from './BaseRangeBook';
import type { Client } from '../client';
import type { GETUsersIdMentionsQuery, GETUsersIdMentionsResponse } from 'twitter-types';
import type { UserResolvable } from '../managers';

/**
 * A class for fetching tweets that mention a twitter user
 */
export class UserMentioningTweetsBook extends BaseRangeBook {
	/**
	 * The Id of the user this book belongs to
	 */
	userId: string;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: UserMentioningTweetsBookOptions) {
		super(client, options);
		const userId = client.users.resolveId(options.user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'create UserMentioningTweetsBook for');
		this.userId = userId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweets} that mention the given user
	 */
	async fetchNextPage(): Promise<Collection<string, Tweet>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	/**
	 * Fetches the previous page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweets} that mention the given user
	 */
	async fetchPreviousPage(): Promise<Collection<string, Tweet>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<string, Tweet>> {
		const tweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETUsersIdMentionsQuery = {
			expansions: queryParameters?.tweetExpansions,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			pagination_token: token,
		};
		if (this.afterTweetId) query.since_id = this.afterTweetId;
		if (this.beforeTweetId) query.until_id = this.beforeTweetId;
		if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
		if (this.startTimestamp) query.start_time = new Date(this.startTimestamp).toISOString();
		if (this.endTimestamp) query.end_time = new Date(this.endTimestamp).toISOString();
		const requestData = new RequestData({ query });
		const data: GETUsersIdMentionsResponse = await this.client._api.users(this.userId).mentions.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return tweets;
		const rawTweets = data.data;
		const rawIncludes = data.includes;
		for (const rawTweet of rawTweets) {
			const tweet = this.client.tweets._add(rawTweet.id, { data: rawTweet, includes: rawIncludes }, false);
			tweets.set(tweet.id, tweet);
		}
		return tweets;
	}
}

export interface UserMentioningTweetsBookOptions extends BaseRangeBookOptions {
	user: UserResolvable;
}
