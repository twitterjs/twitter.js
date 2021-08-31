import { RequestData } from '../misc/Misc.js';
import { BaseStructure } from '../BaseStructure.js';
import { CustomError } from '../../errors/index.js';
import { CountTweetsBookCreateOptions, TweetResolvable } from '../../typings/index.js';
import type { Client } from '../../client/Client.js';
import type { GetTweetCountsQuery, GetTweetCountsResponse, Granularity, Snowflake } from 'twitter-types';

/**
 * A class for fetching tweets using search query
 */
export class CountTweetsBook extends BaseStructure {
  #nextToken?: string;

  #hasBeenInitialized?: boolean;

  /**
   * Whether there are more pages of tweets to be fetched
   *
   * **Note:** Use this as a check for deciding whether to fetch more pages
   */
  hasMore: boolean;

  granularity: Granularity | null;

  /**
   * The query for searching tweets
   */
  query: string;

  startTime: Date | null;

  endTime: Date | null;

  sinceTweetId: Snowflake | null;

  untilTweetId: Snowflake | null;

  constructor(client: Client, options: CountTweetsBookCreateOptions) {
    super(client);
    this.hasMore = true;
    this.query = options.query;
    this.startTime = options.startTime ?? null;
    this.endTime = options.endTime ?? null;
    this.granularity = options.granularity ?? null;
    this.sinceTweetId = this.client.tweets.resolveID(options.sinceTweet as TweetResolvable);
    this.untilTweetId = this.client.tweets.resolveID(options.untilTweet as TweetResolvable);
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns
   */
  async fetchNextPage(): Promise<GetTweetCountsResponse> {
    if (!this.#hasBeenInitialized) {
      this.#hasBeenInitialized = true;
      return this.#fetchPages(this.#nextToken);
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<GetTweetCountsResponse> {
    const query: GetTweetCountsQuery = {
      query: this.query,
      granularity: this.granularity ?? undefined,
      start_time: this.startTime ?? undefined,
      end_time: this.endTime ?? undefined,
      since_id: this.sinceTweetId ?? undefined,
      until_id: this.untilTweetId ?? undefined,
      next_token: token,
    };
    const requestData = new RequestData({ query });
    const data: GetTweetCountsResponse = await this.client._api.tweets.counts.recent.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.hasMore = data.meta.next_token ? true : false;
    // TODO
    return data;
  }
}
