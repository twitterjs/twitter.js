import { BaseBook } from './BaseBook';
import type { Client } from '../client';
import type { Snowflake } from 'twitter-types';
import type { BaseRangeBookOptions } from '../typings';

export class BaseRangeBook extends BaseBook {
  /**
   * The book will fetch tweets that were created after this tweet Id
   */
  afterTweetId: Snowflake | null;

  /**
   * The book will fetch tweets that were created before this tweet Id
   */
  beforeTweetId: Snowflake | null;

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
   * @param options The options to initialize the composed tweets book with
   */
  constructor(client: Client, options: BaseRangeBookOptions) {
    super(client, options);
    this.afterTweetId = (options.afterTweet && client.tweets.resolveId(options.afterTweet)) ?? null;
    this.beforeTweetId = (options.beforeTweet && client.tweets.resolveId(options.beforeTweet)) ?? null;
    this.startTimestamp = (options.startTime && new Date(options.startTime).getTime()) ?? null;
    this.endTimestamp = (options.endTime && new Date(options.endTime).getTime()) ?? null;
  }
}
