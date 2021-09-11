import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData } from '../structures';
import type { Client } from '../client';
import type { Tweet } from '../structures';
import type { CreateComposedTweetsBookOptions } from '../typings';
import type {
  GetUsersTweetsQuery,
  GetUsersTweetsResponse,
  Snowflake,
  TweetTypeExcludesRequestParameter,
} from 'twitter-types';

/**
 * A class for fetching tweets composed by a twitter user
 */
export class ComposedTweetsBook extends BaseBook {
  /**
   * The token for fetching next page
   */
  #nextToken?: string;

  /**
   * The token for fetching previous page
   */
  #previousToken?: string;

  /**
   * Whether an initial request for fetching the first page has already been made
   *
   * **Note**: Use this to not throw `PAGINATED_RESPONSE_TAIL_REACHED` error for initial page request in {@link ComposedTweetsBook.fetchNextPage}
   */
  #hasMadeInitialRequest?: boolean;

  /**
   * The ID of the user this book belongs to
   */
  userId: Snowflake;

  /**
   * The maximum amount of tweets that will be fetched per page.
   *
   * **Note:** This is the max count and will **not** always be equal to the number of tweets fetched in a page
   */
  maxResultsPerPage: number | null;

  /**
   * Whether there are more pages of tweets to be fetched
   *
   * **Note:** Use this as a check for deciding whether to fetch more pages
   */
  hasMore: boolean;

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
   * The types of tweets that the book will not fetch
   */
  exclude: Array<TweetTypeExcludesRequestParameter> | null;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the composed tweets book with
   */
  constructor(client: Client, options: CreateComposedTweetsBookOptions) {
    super(client);
    this.hasMore = true;
    this.userId = options.userId;
    this.exclude = options.exclude ?? null;
    this.afterTweetId = options.afterTweetId ?? null;
    this.beforeTweetId = options.beforeTweetId ?? null;
    this.afterTimestamp = options.afterTimestamp ?? null;
    this.beforeTimestamp = options.beforeTimestamp ?? null;
    this.maxResultsPerPage = options.maxResultsPerPage ?? null;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link Tweet} objects composed by the owner of this book
   */
  async fetchNextPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this.#hasMadeInitialRequest) {
      this.#hasMadeInitialRequest = true;
      return this.#fetchPages();
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of {@link Tweet} objects composed by the owner of this book
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this.#previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this.#previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, Tweet>> {
    const tweetsCollection = new Collection<Snowflake, Tweet>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetUsersTweetsQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
    };
    if (this.exclude) query.exclude = this.exclude;
    if (this.afterTweetId) query.since_id = this.afterTweetId;
    if (this.beforeTweetId) query.until_id = this.beforeTweetId;
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    if (this.afterTimestamp) query.start_time = new Date(this.afterTimestamp).toISOString();
    if (this.beforeTimestamp) query.end_time = new Date(this.beforeTimestamp).toISOString();
    const requestData = new RequestData({ query });
    const data: GetUsersTweetsResponse = await this.client._api.users(this.userId).tweets.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    if (data.meta.result_count === 0) return tweetsCollection;
    const rawTweets = data.data;
    const rawIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = this.client.tweets.add(rawTweet.id, { data: rawTweet, includes: rawIncludes }, false);
      tweetsCollection.set(tweet.id, tweet);
    }
    return tweetsCollection;
  }
}
