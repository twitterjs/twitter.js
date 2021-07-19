import Tweet from '../Tweet.js';
import { RequestData } from '../misc/Misc.js';
import BaseStructure from '../BaseStructure.js';
import Collection from '../../util/Collection.js';
import { CustomError } from '../../errors/index.js';
import type { ClientInUse, ClientUnionType } from '../../typings/Types.js';
import type { GetUsersLikedTweetsQuery, GetUsersLikedTweetsResponse, Snowflake } from 'twitter-types';

/**
 * A class used for keeping track of liked tweets of a twitter user
 */
export default class LikedTweetsBook<C extends ClientUnionType> extends BaseStructure<C> {
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

  /**
   * The collection of tweets that have been fetched
   */
  cache: Collection<Snowflake, Tweet<C>>;

  constructor(client: ClientInUse<C>, userID: Snowflake, maxResultsPerPage?: number) {
    super(client);
    this.userID = userID;
    this.maxResultsPerPage = maxResultsPerPage ?? null;
    this.hasMore = true;
    this.cache = new Collection<Snowflake, Tweet<C>>();
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of tweets liked by the specified user
   */
  async fetchNextPage(): Promise<Collection<Snowflake, Tweet<C>>> {
    if (!this.#hasBeenInitialized) {
      this.#hasBeenInitialized = true;
      return this.#fetchPages(this.#nextToken, true);
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken, true);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of tweets liked by the specified user
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, Tweet<C>>> {
    if (!this.#previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this.#previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string, isNext?: boolean): Promise<Collection<Snowflake, Tweet<C>>> {
    const likedTweetsCollection = new Collection<Snowflake, Tweet<C>>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetUsersLikedTweetsQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      pagination_token: token,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData(query, null);
    const data: GetUsersLikedTweetsResponse = await this.client._api.users(this.userID).liked_tweets.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    const rawTweets = data.data;
    const rawIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = new Tweet(this.client, { data: rawTweet, includes: rawIncludes });
      likedTweetsCollection.set(tweet.id, tweet);
    }
    if (isNext) this.cache = this.cache.concat(likedTweetsCollection);
    return likedTweetsCollection;
  }
}
