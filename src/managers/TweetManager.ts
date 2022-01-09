import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import {
  RemovedRetweetResponse,
  RequestData,
  RetweetResponse,
  TweetLikeResponse,
  TweetReplyHideUnhideResponse,
  TweetUnlikeResponse,
  SimplifiedTweet,
  User,
  Tweet,
  TweetPayload,
} from '../structures';
import { CustomError, CustomTypeError } from '../errors';
import type { Client } from '../client';
import type {
  TweetManagerFetchResult,
  TweetResolvable,
  FetchTweetOptions,
  FetchTweetsOptions,
  TweetCreateOptions,
} from '../typings';
import type {
  DELETETweetsIdResponse,
  DELETEUsersIdLikesTweetIdResponse,
  DELETEUsersIdRetweetsSourceTweetIdResponse,
  GETTweetsIdLikingUsersQuery,
  GETTweetsIdLikingUsersResponse,
  GETTweetsIdQuery,
  GETTweetsIdResponse,
  GETTweetsIdRetweetedByQuery,
  GETTweetsIdRetweetedByResponse,
  GETTweetsQuery,
  GETTweetsResponse,
  POSTTweetsResponse,
  POSTUsersIdLikesJSONBody,
  POSTUsersIdLikesResponse,
  POSTUsersIdRetweetsJSONBody,
  POSTUsersIdRetweetsResponse,
  PUTTweetsIdHiddenJSONBody,
  PUTTweetsIdHiddenResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link Tweet} objects and stores their cache
 */
export class TweetManager extends BaseManager<Snowflake, TweetResolvable, Tweet> {
  /**
   * @param client The logged in {@link Client} instance
   */
  constructor(client: Client) {
    super(client, Tweet);
  }

  /**
   * Resolves a tweet resolvable to its respective {@link Tweet} object.
   * @param tweetResolvable An ID or instance that can be resolved to a tweet object
   * @returns The resolved tweet object
   */
  override resolve(tweetResolvable: TweetResolvable): Tweet | null {
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
  override resolveId(tweetResolvable: TweetResolvable): Snowflake | null {
    const tweetId = super.resolveId(tweetResolvable);
    if (typeof tweetId === 'string') return tweetId;
    if (tweetResolvable instanceof SimplifiedTweet) return tweetResolvable.id;
    return null;
  }

  /**
   * Fetches tweets from twitter.
   * @param options The options for fetching tweets
   * @returns A {@link Tweet} or a {@link Collection} of them as a `Promise`
   */
  async fetch<T extends FetchTweetOptions | FetchTweetsOptions>(options: T): Promise<TweetManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('tweet' in options) {
      const tweetId = this.resolveId(options.tweet);
      if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
      return this.#fetchSingleTweet(tweetId, options) as Promise<TweetManagerFetchResult<T>>;
    }
    if ('tweets' in options) {
      if (!Array.isArray(options.tweets)) throw new CustomTypeError('INVALID_TYPE', 'tweets', 'array', true);
      const tweetIds = options.tweets.map(tweet => {
        const tweetId = this.resolveId(tweet);
        if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
        return tweetId;
      });
      return this.#fetchMultipleTweets(tweetIds, options) as Promise<TweetManagerFetchResult<T>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Likes a tweet.
   * @param targetTweet The tweet to like
   * @returns A {@link TweetLikeResponse} object
   */
  async like(targetTweet: TweetResolvable): Promise<TweetLikeResponse> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'like');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: POSTUsersIdLikesJSONBody = {
      tweet_id: tweetId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: POSTUsersIdLikesResponse = await this.client._api.users(loggedInUser.id).likes.post(requestData);
    return new TweetLikeResponse(data);
  }

  /**
   * Unlikes a tweet.
   * @param targetTweet The tweet to unlike
   * @returns A {@link TweetUnlikeResponse} object
   */
  async unlike(targetTweet: TweetResolvable): Promise<TweetUnlikeResponse> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'unlike');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DELETEUsersIdLikesTweetIdResponse = await this.client._api
      .users(loggedInUser.id)
      .likes(tweetId)
      .delete(requestData);
    return new TweetUnlikeResponse(data);
  }

  /**
   * Hides a reply to a tweet of the authorized user.
   * @param targetTweet The reply to hide. This should be a tweet reply to a tweet of the authorized user
   * @returns A {@link TweetReplyHideUnhideResponse} object
   */
  async hide(targetTweet: TweetResolvable): Promise<TweetReplyHideUnhideResponse> {
    return this.#editTweetReplyVisibility(targetTweet, true);
  }

  /**
   * Unhides a reply to a tweet of the authorized user.
   * @param targetTweet The reply to unhide. This should be a tweet reply to one of the tweets of the authorized user
   * @returns A {@link TweetReplyHideUnhideResponse} object
   */
  async unhide(targetTweet: TweetResolvable): Promise<TweetReplyHideUnhideResponse> {
    return this.#editTweetReplyVisibility(targetTweet, false);
  }

  /**
   * Retweets a tweet.
   * @param targetTweet The tweet to retweet
   * @returns A {@link RetweetResponse} object
   */
  async retweet(targetTweet: TweetResolvable): Promise<RetweetResponse> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'retweet');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: POSTUsersIdRetweetsJSONBody = {
      tweet_id: tweetId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: POSTUsersIdRetweetsResponse = await this.client._api.users(loggedInUser.id).retweets.post(requestData);
    return new RetweetResponse(data);
  }

  /**
   * Removes the retweet of a tweet.
   * @param targetTweet The tweet whose retweet is to be removed
   * @returns A {@link RemovedRetweetResponse} object
   */
  async unRetweet(targetTweet: TweetResolvable): Promise<RemovedRetweetResponse> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'remove retweet');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DELETEUsersIdRetweetsSourceTweetIdResponse = await this.client._api
      .users(loggedInUser.id)
      .retweets(tweetId)
      .delete(requestData);
    return new RemovedRetweetResponse(data);
  }

  /**
   * Fetches users who have retweeted a tweet.
   * @param targetTweet The tweet whose retweeters are to be fetched
   * @returns A {@link Collection} of {@link User} objects
   */
  async fetchRetweetedBy(targetTweet: TweetResolvable): Promise<Collection<Snowflake, User>> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'remove retweet');
    const queryParameters = this.client.options.queryParameters;
    const query: GETTweetsIdRetweetedByQuery = {
      expansions: queryParameters?.userExpansions,
      'user.fields': queryParameters?.userFields,
      'tweet.fields': queryParameters?.tweetFields,
    };
    const requestData = new RequestData({ query });
    const data: GETTweetsIdRetweetedByResponse = await this.client._api.tweets(tweetId).retweeted_by.get(requestData);
    const retweetedByUsersCollection = new Collection<Snowflake, User>();
    if (data.meta.result_count === 0) return retweetedByUsersCollection;
    const rawUsers = data.data;
    const rawIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = new User(this.client, { data: rawUser, includes: rawIncludes });
      retweetedByUsersCollection.set(user.id, user);
    }
    return retweetedByUsersCollection;
  }

  /**
   * Fetches a collection of users who liked a tweet.
   * @param targetTweet The tweet whose liking users are to be fetched
   * @returns A {@link Collection} of {@link User} objects who liked the specified tweet
   */
  async fetchLikedBy(targetTweet: TweetResolvable): Promise<Collection<Snowflake, User>> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'fetch liking users');
    const queryParameters = this.client.options.queryParameters;
    const query: GETTweetsIdLikingUsersQuery = {
      expansions: queryParameters?.userExpansions,
      'user.fields': queryParameters?.userFields,
      'tweet.fields': queryParameters?.tweetFields,
    };
    const requestData = new RequestData({ query });
    const data: GETTweetsIdLikingUsersResponse = await this.client._api.tweets(tweetId).liking_users.get(requestData);
    const likedByUsersCollection = new Collection<Snowflake, User>();
    if (data.meta.result_count === 0) return likedByUsersCollection;
    const rawUsers = data.data;
    const rawIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = new User(this.client, { data: rawUser, includes: rawIncludes });
      likedByUsersCollection.set(user.id, user);
    }
    return likedByUsersCollection;
  }

  /**
   * Creates a new tweet.
   * @param options The options for creating the tweet
   * @returns The id and text of the created tweet
   */
  async create(options: TweetCreateOptions): Promise<{ id: Snowflake; text: string }> {
    const data = new TweetPayload(this.client, options).resolveData();
    const requestData = new RequestData({ body: data, isUserContext: true });
    const res: POSTTweetsResponse = await this.client._api.tweets.post(requestData);
    return res.data;
  }

  /**
   * Deletes a tweet created by the authorized user.
   * @param tweet The tweet to delete
   * @returns A boolean representing whether the tweet got deleted
   */
  async delete(tweet: TweetResolvable): Promise<boolean> {
    const tweetId = this.resolveId(tweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'delete');
    const requestData = new RequestData({ isUserContext: true });
    const res: DELETETweetsIdResponse = await this.client._api.tweets(tweetId).delete(requestData);
    return res.data.deleted;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleTweet(tweetId: Snowflake, options: FetchTweetOptions): Promise<Tweet> {
    if (!options.skipCacheCheck) {
      const cachedTweet = this.cache.get(tweetId);
      if (cachedTweet) return cachedTweet;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GETTweetsIdQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GETTweetsIdResponse = await this.client._api.tweets(tweetId).get(requestData);
    return this._add(data.data.id, data, options.cacheAfterFetching);
  }

  async #fetchMultipleTweets(
    tweetIds: Array<Snowflake>,
    options: FetchTweetsOptions,
  ): Promise<Collection<Snowflake, Tweet>> {
    const fetchedTweetCollection = new Collection<Snowflake, Tweet>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETTweetsQuery = {
      ids: tweetIds,
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GETTweetsResponse = await this.client._api.tweets.get(requestData);
    const rawTweets = data.data;
    const rawTweetsIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = this._add(rawTweet.id, { data: rawTweet, includes: rawTweetsIncludes }, options.cacheAfterFetching);
      fetchedTweetCollection.set(tweet.id, tweet);
    }
    return fetchedTweetCollection;
  }

  async #editTweetReplyVisibility(
    targetTweet: TweetResolvable,
    isHidden: boolean,
  ): Promise<TweetReplyHideUnhideResponse> {
    const tweetId = this.resolveId(targetTweet);
    if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', `${isHidden ? 'hide' : 'unhide'}`);
    const body: PUTTweetsIdHiddenJSONBody = {
      hidden: isHidden,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PUTTweetsIdHiddenResponse = await this.client._api.tweets(tweetId).hidden.put(requestData);
    return new TweetReplyHideUnhideResponse(data);
  }
}
