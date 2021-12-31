import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, TweetCountBucket } from '../structures';
import type { Client } from '../client';
import type { TweetsCountBookOptions } from '../typings';
import type { GET_2_tweets_counts_recent_Query, GET_2_tweets_counts_recent_Response, Snowflake } from 'twitter-types';

/**
 * A class for fetching number of tweets matching a search query
 */
export class TweetsCountBook extends BaseBook {
  /**
   * The token for fetching next page
   */
  #nextToken?: string;

  /**
   * Whether an initial request for fetching the first page has already been made
   *
   * **Note**: Use this to **not** throw `PAGINATED_RESPONSE_TAIL_REACHED` error for initial page request in {@link BlocksBook.fetchNextPage}
   */
  #hasMadeInitialRequest?: boolean;

  /**
   * Whether there are more pages to be fetched
   *
   * **Note:** Use this as a check for deciding whether to fetch more pages
   */
  hasMore: boolean;

  /**
   * The query for searching tweets
   */
  query: string;

  /**
   * The book will group buckets according to this granularity
   */
  granularity: GET_2_tweets_counts_recent_Query['granularity'] | null;

  /**
   * The book will fetch tweets that were created after this tweet ID
   */
  afterTweetId: Snowflake | null;

  /**
   * The book will fetch tweets that were created before this tweet ID
   */
  beforeTweetId: Snowflake | null;

  /**
   * The book will fetch tweets that were created after this timestamp
   */
  afterTimestamp: number | null;

  /**
   * The book will fetch tweets that were created before this timestamp
   */
  beforeTimestamp: number | null;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the count tweets book with
   */
  constructor(client: Client, options: TweetsCountBookOptions) {
    super(client);
    this.hasMore = true;
    this.query = options.query;
    this.granularity = options.granularity ?? null;
    this.afterTweetId = options.afterTweetId ?? null;
    this.beforeTweetId = options.beforeTweetId ?? null;
    this.afterTimestamp = options.afterTimestamp ?? null;
    this.beforeTimestamp = options.beforeTimestamp ?? null;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns
   */
  async fetchNextPage(): Promise<Array<TweetCountBucket>> {
    if (!this.#hasMadeInitialRequest) {
      this.#hasMadeInitialRequest = true;
      return this.#fetchPages();
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Array<TweetCountBucket>> {
    const tweetCountBuckets: Array<TweetCountBucket> = [];
    const query: GET_2_tweets_counts_recent_Query = {
      query: this.query,
      next_token: token,
    };
    if (this.granularity) query.granularity = this.granularity;
    if (this.afterTweetId) query.since_id = this.afterTweetId;
    if (this.beforeTweetId) query.until_id = this.beforeTweetId;
    if (this.afterTimestamp) query.start_time = new Date(this.afterTimestamp).toISOString();
    if (this.beforeTimestamp) query.end_time = new Date(this.beforeTimestamp).toISOString();
    const requestData = new RequestData({ query });
    const data: GET_2_tweets_counts_recent_Response = await this.client._api.tweets.counts.recent.get(requestData);
    this.#nextToken = data.meta.next_token;
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
