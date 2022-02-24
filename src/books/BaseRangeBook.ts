import { BaseBook, type BaseBookOptions } from './BaseBook';
import type { Client } from '../client';
import type { TweetResolvable } from '../managers';

export class BaseRangeBook extends BaseBook {
	/**
	 * The book will fetch tweets that were created after this tweet Id
	 */
	afterTweetId: string | null;

	/**
	 * The book will fetch tweets that were created before this tweet Id
	 */
	beforeTweetId: string | null;

	/**
	 * The book will fetch tweets that were created at or after this timestamp
	 */
	startTimestamp: number | null;

	/**
	 * The book will fetch tweets that were created at or before this timestamp
	 */
	endTimestamp: number | null;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: BaseRangeBookOptions) {
		super(client, options);
		this.afterTweetId = (options.afterTweet && client.tweets.resolveId(options.afterTweet)) ?? null;
		this.beforeTweetId = (options.beforeTweet && client.tweets.resolveId(options.beforeTweet)) ?? null;
		this.startTimestamp = (options.startTime && new Date(options.startTime).getTime()) ?? null;
		this.endTimestamp = (options.endTime && new Date(options.endTime).getTime()) ?? null;
	}
}

export interface BaseRangeBookOptions extends BaseBookOptions {
	/**
	 * Only return tweets that were created at or after this time
	 */
	startTime?: number | Date;

	/**
	 * Only return tweets that were created at or before this time
	 */
	endTime?: number | Date;

	/**
	 * Only return tweets that were created after this tweet
	 */
	afterTweet?: TweetResolvable;

	/**
	 * Only return tweets that were created before this tweet
	 */
	beforeTweet?: TweetResolvable;
}
