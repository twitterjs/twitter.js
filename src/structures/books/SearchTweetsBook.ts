import Tweet from '../Tweet.js';
import { RequestData } from '../misc/Misc.js';
import BaseStructure from '../BaseStructure.js';
import Collection from '../../util/Collection.js';
import { CustomError } from '../../errors/index.js';
import { SearchTweetsBookCreateOptions, TweetResolvable } from '../../typings/index.js';
import type Client from '../../client/Client.js';
import type { GetTweetSearchQuery, GetTweetSearchResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching tweets using search query
 */
export default class SearchTweetsBook extends BaseStructure {
  #nextToken?: string;

  #hasBeenInitialized?: boolean;

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
   * The query for searching tweets
   */
  query: string;

  startTime: Date | null;

  endTime: Date | null;

  sinceTweetId: Snowflake | null;

  untilTweetId: Snowflake | null;

  constructor(client: Client, options: SearchTweetsBookCreateOptions) {
    super(client);
    this.hasMore = true;
    this.maxResultsPerPage = options.maxResultsPerPage ?? null;
    this.query = options.query;
    this.startTime = options.startTime ?? null;
    this.endTime = options.endTime ?? null;
    this.sinceTweetId = this.client.tweets.resolveID(options.sinceTweet as TweetResolvable);
    this.untilTweetId = this.client.tweets.resolveID(options.untilTweet as TweetResolvable);
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of tweets matching the query
   */
  async fetchNextPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this.#hasBeenInitialized) {
      this.#hasBeenInitialized = true;
      return this.#fetchPages(this.#nextToken);
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, Tweet>> {
    const fetchedTweetsCollection = new Collection<Snowflake, Tweet>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetTweetSearchQuery = {
      expansions: queryParameters?.tweetExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      query: this.query,
      max_results: this.maxResultsPerPage ?? undefined,
      start_time: this.startTime ?? undefined,
      end_time: this.endTime ?? undefined,
      since_id: this.sinceTweetId ?? undefined,
      until_id: this.untilTweetId ?? undefined,
      next_token: token,
    };
    const requestData = new RequestData({ query });
    const data: GetTweetSearchResponse = await this.client._api.tweets.search.recent.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.hasMore = data.meta.next_token ? true : false;
    const rawTweets = data.data;
    if (!rawTweets) return fetchedTweetsCollection;
    const rawIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = new Tweet(this.client, { data: rawTweet, includes: rawIncludes });
      fetchedTweetsCollection.set(tweet.id, tweet);
    }
    return fetchedTweetsCollection;
  }
}
