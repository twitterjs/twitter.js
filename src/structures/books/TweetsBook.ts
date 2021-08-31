import { Tweet } from '../Tweet.js';
import { RequestData } from '../misc/Misc.js';
import { BaseStructure } from '../BaseStructure.js';
import { Collection } from '../../util/Collection.js';
import { CustomError } from '../../errors/index.js';
import type { Client } from '../../client/Client.js';
import type { GetUsersTweetsQuery, GetUsersTweetsResponse, Snowflake } from 'twitter-types';

/**
 * A class used for keeping track of tweets composed by a twitter user
 */
export class TweetsBook extends BaseStructure {
  #nextToken?: string;

  #previousToken?: string;

  #hasBeenInitialized?: boolean;

  /**
   * The ID of the user this book belongs to
   */
  userID: Snowflake;

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

  constructor(client: Client, userID: Snowflake, maxResultsPerPage?: number) {
    super(client);
    this.userID = userID;
    this.maxResultsPerPage = maxResultsPerPage ?? null;
    this.hasMore = true;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of tweets composed by the specified user
   */
  async fetchNextPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this.#hasBeenInitialized) {
      this.#hasBeenInitialized = true;
      return this.#fetchPages(this.#nextToken);
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of tweets composed by the specified user
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
      pagination_token: token,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData({ query });
    const data: GetUsersTweetsResponse = await this.client._api.users(this.userID).tweets.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    const rawTweets = data.data;
    const rawIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = new Tweet(this.client, { data: rawTweet, includes: rawIncludes });
      tweetsCollection.set(tweet.id, tweet);
    }
    return tweetsCollection;
  }
}
