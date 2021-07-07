import Tweet from '../structures/Tweet.js';
import BaseManager from './BaseManager.js';
import Collection from '../util/Collection.js';
import { RequestData } from '../structures/misc/Misc.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import type { TweetManagerFetchResult, TweetResolvable, ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { FetchTweetOptions, FetchTweetsOptions } from '../typings/Interfaces.js';
import type {
  GetMultipleTweetsByIdsQuery,
  GetMultipleTweetsByIdsResponse,
  GetSingleTweetByIdQuery,
  GetSingleTweetByIdResponse,
  Snowflake,
} from 'twitter-types';

/**
 * Holds API methods for tweets and stores their cache
 */
export default class TweetManager<C extends ClientUnionType> extends BaseManager<
  Snowflake,
  TweetResolvable<C>,
  Tweet<C>,
  C
> {
  constructor(client: ClientInUse<C>) {
    super(client, Tweet);
  }

  /**
   * Fetches tweets from twitter
   * @param options The options for fetching tweets
   * @returns A {@link Tweet} or a {@link Collection} of them as a Promise
   */
  async fetch<T extends FetchTweetOptions<C> | FetchTweetsOptions<C>>(
    options: T,
  ): Promise<TweetManagerFetchResult<T, C>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('tweet' in options) {
      const tweetID = this.resolveID(options.tweet);
      if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID');
      return this.#fetchSingleTweet(tweetID, options) as Promise<TweetManagerFetchResult<T, C>>;
    }
    if ('tweets' in options) {
      if (!Array.isArray(options.tweets)) throw new CustomTypeError('INVALID_TYPE', 'tweets', 'array', true);
      const tweetIDs = options.tweets.map(tweet => {
        const tweetID = this.resolveID(tweet);
        if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID');
        return tweetID;
      });
      return this.#fetchMultipleTweets(tweetIDs, options) as Promise<TweetManagerFetchResult<T, C>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleTweet(tweetID: Snowflake, options: FetchTweetOptions<C>): Promise<Tweet<C>> {
    if (!options.skipCacheCheck) {
      const cachedTweet = this.cache.get(tweetID);
      if (cachedTweet) return cachedTweet;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GetSingleTweetByIdQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetSingleTweetByIdResponse = await this.client._api.tweets(tweetID).get(requestData);
    return this.add(data.data.id, data, options.cacheAfterFetching);
  }

  async #fetchMultipleTweets(
    tweetIDs: Array<Snowflake>,
    options: FetchTweetsOptions<C>,
  ): Promise<Collection<Snowflake, Tweet<C>>> {
    const fetchedTweetCollection = new Collection<Snowflake, Tweet<C>>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleTweetsByIdsQuery = {
      ids: tweetIDs,
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetMultipleTweetsByIdsResponse = await this.client._api.tweets.get(requestData);
    const rawTweets = data.data;
    const rawTweetsIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = this.add(rawTweet.id, { data: rawTweet, includes: rawTweetsIncludes }, options.cacheAfterFetching);
      fetchedTweetCollection.set(tweet.id, tweet);
    }
    return fetchedTweetCollection;
  }
}
