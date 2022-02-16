import { Collection } from '../util';
import { CustomError } from '../errors';
import { RequestData } from '../structures';
import { BaseRangeBook } from './BaseRangeBook';
import type { Client } from '../client';
import type { Tweet } from '../structures';
import type { SearchTweetsBookOptions } from '../typings';
import type { GETTweetsSearchRecentQuery, GETTweetsSearchRecentResponse } from 'twitter-types';

/**
 * A class for fetching tweets using a search query
 */
export class SearchTweetsBook extends BaseRangeBook {
	/**
	 * The query for searching the tweets
	 */
	query: string;

	/**
	 * The order in which tweets would return
	 */
	sortOrder: GETTweetsSearchRecentQuery['sort_order'] | null;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: SearchTweetsBookOptions) {
		super(client, options);
		this.query = options.query;
		this.sortOrder = options.sortOrder ?? null;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweet} matching the given search query
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
		const tweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETTweetsSearchRecentQuery = {
			expansions: queryParameters?.tweetExpansions,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			query: this.query,
			next_token: token,
			sort_order: this.sortOrder ?? undefined,
			since_id: this.afterTweetId ?? undefined,
			until_id: this.beforeTweetId ?? undefined,
			max_results: this.maxResultsPerPage ?? undefined,
			start_time: this.startTimestamp ? new Date(this.startTimestamp).toISOString() : undefined,
			end_time: this.endTimestamp ? new Date(this.endTimestamp).toISOString() : undefined,
		};
		const requestData = new RequestData({ query });
		const data: GETTweetsSearchRecentResponse = await this.client._api.tweets.search.recent.get(requestData);
		this._nextToken = data.meta.next_token;
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
