import type { GETTweetsIdQuoteTweetsQuery, GETTweetsIdQuoteTweetsResponse } from 'twitter-types';
import type { Client } from '../client';
import { CustomError } from '../errors';
import { RequestData, type Tweet } from '../structures';
import { BaseBook, BaseBookOptions } from './BaseBook';
import { Collection } from '../util';

/**
 * A class for fetching quote tweets of a tweet
 */
export class QuoteTweetsBook extends BaseBook {
	/**
	 * The tweet id whose quote tweets are to be fetched
	 */
	tweetId: string;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: QuoteTweetsBookOptions) {
		super(client, options);
		this.tweetId = options.tweetId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweet} that quote the given tweet
	 */
	async fetchNextPage(): Promise<Collection<string, Tweet>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	async #fetchPages(token?: string): Promise<Collection<string, Tweet>> {
		const quoteTweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETTweetsIdQuoteTweetsQuery = {
			expansions: queryParameters?.tweetExpansions,
			max_results: this.maxResultsPerPage ?? undefined,
			'media.fields': queryParameters?.mediaFields,
			pagination_token: token,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const data: GETTweetsIdQuoteTweetsResponse = await this.client._api
			.tweets(this.tweetId)
			.quote_tweets.get(requestData);
		this._nextToken = data.meta.next_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return quoteTweets;
		const rawTweets = data.data;
		const rawIncludes = data.includes;
		for (const rawTweet of rawTweets) {
			const tweet = this.client.tweets._add(rawTweet.id, { data: rawTweet, includes: rawIncludes }, false);
			quoteTweets.set(tweet.id, tweet);
		}
		return quoteTweets;
	}
}

export interface QuoteTweetsBookOptions extends BaseBookOptions {
	tweetId: string;
}
