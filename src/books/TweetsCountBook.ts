import { CustomError } from '../errors';
import { BaseRangeBook } from './BaseRangeBook';
import { RequestData, TweetCountBucket } from '../structures';
import type { Client } from '../client';
import type { TweetsCountBookOptions } from '../typings';
import type { GETTweetsCountsRecentQuery, GETTweetsCountsRecentResponse } from 'twitter-types';

/**
 * A class for fetching number of tweets matching a search query
 */
export class TweetsCountBook extends BaseRangeBook {
	/**
	 * The query for searching the tweets
	 */
	query: string;

	/**
	 * The book will group buckets according to this granularity
	 */
	granularity: GETTweetsCountsRecentQuery['granularity'] | null;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: TweetsCountBookOptions) {
		super(client, options);
		this.query = options.query;
		this.granularity = options.granularity ?? null;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns
	 */
	async fetchNextPage(): Promise<Array<TweetCountBucket>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	async #fetchPages(token?: string): Promise<Array<TweetCountBucket>> {
		const tweetCountBuckets: Array<TweetCountBucket> = [];
		const query: GETTweetsCountsRecentQuery = {
			query: this.query,
			next_token: token,
		};
		if (this.granularity) query.granularity = this.granularity;
		if (this.afterTweetId) query.since_id = this.afterTweetId;
		if (this.beforeTweetId) query.until_id = this.beforeTweetId;
		if (this.startTimestamp) query.start_time = new Date(this.startTimestamp).toISOString();
		if (this.endTimestamp) query.end_time = new Date(this.endTimestamp).toISOString();
		const requestData = new RequestData({ query });
		const data: GETTweetsCountsRecentResponse = await this.client._api.tweets.counts.recent.get(requestData);
		this._nextToken = data.meta.next_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.total_tweet_count === 0) return tweetCountBuckets;
		const rawBuckets = data.data;
		for (const rawBucket of rawBuckets) {
			const bucket = new TweetCountBucket(rawBucket, this.granularity);
			tweetCountBuckets.push(bucket);
		}
		return tweetCountBuckets;
	}
}
