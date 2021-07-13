import Tweet from '../structures/Tweet.js';
import BaseManager from './BaseManager.js';
import Collection from '../util/Collection.js';
import {
  RequestData,
  TweetLikeResponse,
  TweetReplyHideUnhideResponse,
  TweetUnlikeResponse,
} from '../structures/misc/Misc.js';
import SimplifiedTweet from '../structures/SimplifiedTweet.js';
import UserContextClient from '../client/UserContextClient.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import SampledTweetStream from '../structures/misc/SampledTweetStream.js';
import type { TweetManagerFetchResult, TweetResolvable, ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { FetchTweetOptions, FetchTweetsOptions } from '../typings/Interfaces.js';
import type {
  DeleteTweetUnlikeResponse,
  GetMultipleTweetsByIdsQuery,
  GetMultipleTweetsByIdsResponse,
  GetSingleTweetByIdQuery,
  GetSingleTweetByIdResponse,
  PostTweetLikeJSONBody,
  PostTweetLikeResponse,
  PutTweetReplyHideUnhideJSONBody,
  PutTweetReplyHideUnhideResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link Tweet} objects and stores their cache
 */
export default class TweetManager<C extends ClientUnionType> extends BaseManager<
  Snowflake,
  TweetResolvable<C>,
  Tweet<C>,
  C
> {
  /**
   * @param client The client this manager belongs to
   */
  constructor(client: ClientInUse<C>) {
    super(client, Tweet);
  }

  /**
   * Resolves a tweet resolvable to its respective {@link Tweet} object.
   * @param tweetResolvable An ID or instance that can be resolved to a tweet object
   * @returns The resolved tweet object
   */
  override resolve(tweetResolvable: TweetResolvable<C>): Tweet<C> | null {
    const tweet = super.resolve(tweetResolvable);
    if (tweet) return tweet;
    if (tweetResolvable instanceof SimplifiedTweet) return super.resolve(tweetResolvable.id);
    return null;
  }

  /**
   * Resolves a tweet resolvable to its respective id.
   * @param tweetResolvable An ID or instance that can be resolved to a tweet object
   * @returns The id of the resolved tweet object
   */
  override resolveID(tweetResolvable: TweetResolvable<C>): Snowflake | null {
    const tweetID = super.resolveID(tweetResolvable);
    if (typeof tweetID === 'string') return tweetID;
    if (tweetResolvable instanceof SimplifiedTweet) return tweetResolvable.id;
    return null;
  }

  /**
   * Fetches tweets from twitter.
   * @param options The options for fetching tweets
   * @returns A {@link Tweet} or a {@link Collection} of them as a `Promise`
   */
  async fetch<T extends FetchTweetOptions<C> | FetchTweetsOptions<C>>(
    options: T,
  ): Promise<TweetManagerFetchResult<T, C>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('tweet' in options) {
      const tweetID = this.resolveID(options.tweet);
      if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
      return this.#fetchSingleTweet(tweetID, options) as Promise<TweetManagerFetchResult<T, C>>;
    }
    if ('tweets' in options) {
      if (!Array.isArray(options.tweets)) throw new CustomTypeError('INVALID_TYPE', 'tweets', 'array', true);
      const tweetIDs = options.tweets.map(tweet => {
        const tweetID = this.resolveID(tweet);
        if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
        return tweetID;
      });
      return this.#fetchMultipleTweets(tweetIDs, options) as Promise<TweetManagerFetchResult<T, C>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Likes a tweet.
   * @param targetTweet The tweet to like
   * @returns A {@link TweetLikeResponse} object
   */
  async like(targetTweet: TweetResolvable<C>): Promise<TweetLikeResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'like');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostTweetLikeJSONBody = {
      tweet_id: targetTweetID,
    };
    const requestData = new RequestData(null, body);
    const data: PostTweetLikeResponse = await this.client._api.users(loggedInUser.id).likes.post(requestData);
    return new TweetLikeResponse(data);
  }

  /**
   * Unlikes a tweet.
   * @param targetTweet The tweet to unlike
   * @returns A {@link TweetUnlikeResponse} object
   */
  async unlike(targetTweet: TweetResolvable<C>): Promise<TweetUnlikeResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'unlike');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const data: DeleteTweetUnlikeResponse = await this.client._api.users(loggedInUser.id).likes(targetTweetID).delete();
    return new TweetUnlikeResponse(data);
  }

  /**
   * Hides a reply to a tweet of the authorized user.
   * @param targetTweet The reply to hide. This should be a tweet reply to a tweet of the authorized user
   * @returns A {@link TweetReplyHideUnhideResponse} object
   */
  async hide(targetTweet: TweetResolvable<C>): Promise<TweetReplyHideUnhideResponse> {
    return this.#editTweetReplyVisibility(targetTweet, true);
  }

  /**
   * Unhides a reply to a tweet of the authorized user.
   * @param targetTweet The reply to unhide. This should be a tweet reply to one of the tweets of the authorized user
   * @returns A {@link TweetReplyHideUnhideResponse} object
   */
  async unhide(targetTweet: TweetResolvable<C>): Promise<TweetReplyHideUnhideResponse> {
    return this.#editTweetReplyVisibility(targetTweet, false);
  }

  /**
   * Creates a listener for sampled tweet stream.
   * @returns A {@link SampledTweetStream} object
   */
  createSampledTweetStream(): SampledTweetStream<C> {
    return new SampledTweetStream(this.client);
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

  async #editTweetReplyVisibility(
    targetTweet: TweetResolvable<C>,
    isHidden: boolean,
  ): Promise<TweetReplyHideUnhideResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', `${isHidden ? 'hide' : 'unhide'}`);
    const body: PutTweetReplyHideUnhideJSONBody = {
      hidden: isHidden,
    };
    const requestData = new RequestData(null, body);
    const data: PutTweetReplyHideUnhideResponse = await this.client._api.tweets(targetTweetID).hidden.put(requestData);
    return new TweetReplyHideUnhideResponse(data);
  }
}
