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
} from '../structures';
import { CustomError, CustomTypeError } from '../errors';
import type { Client } from '../client';
import type { TweetManagerFetchResult, TweetResolvable, FetchTweetOptions, FetchTweetsOptions } from '../typings';
import type {
  DeleteTweetsLikeResponse,
  DeleteUsersRetweetsResponse,
  GetMultipleTweetsByIdsQuery,
  GetMultipleTweetsByIdsResponse,
  GetSingleTweetByIdQuery,
  GetSingleTweetByIdResponse,
  GetTweetsLikingUsersQuery,
  GetTweetsLikingUsersResponse,
  GetTweetsRetweetingUsersQuery,
  GetTweetsRetweetingUsersResponse,
  PostTweetsLikeJSONBody,
  PostTweetsLikeResponse,
  PostUsersRetweetsJSONBody,
  PostUsersRetweetsResponse,
  PutTweetReplyHideUnhideJSONBody,
  PutTweetReplyHideUnhideResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link Tweet} objects and stores their cache
 */
export class TweetManager extends BaseManager<Snowflake, TweetResolvable, Tweet> {
  /**
   * @param client The client this manager belongs to
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
  override resolveID(tweetResolvable: TweetResolvable): Snowflake | null {
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
  async fetch<T extends FetchTweetOptions | FetchTweetsOptions>(options: T): Promise<TweetManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('tweet' in options) {
      const tweetID = this.resolveID(options.tweet);
      if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
      return this.#fetchSingleTweet(tweetID, options) as Promise<TweetManagerFetchResult<T>>;
    }
    if ('tweets' in options) {
      if (!Array.isArray(options.tweets)) throw new CustomTypeError('INVALID_TYPE', 'tweets', 'array', true);
      const tweetIDs = options.tweets.map(tweet => {
        const tweetID = this.resolveID(tweet);
        if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
        return tweetID;
      });
      return this.#fetchMultipleTweets(tweetIDs, options) as Promise<TweetManagerFetchResult<T>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Likes a tweet.
   * @param targetTweet The tweet to like
   * @returns A {@link TweetLikeResponse} object
   */
  async like(targetTweet: TweetResolvable): Promise<TweetLikeResponse> {
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'like');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostTweetsLikeJSONBody = {
      tweet_id: targetTweetID,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PostTweetsLikeResponse = await this.client._api.users(loggedInUser.id).likes.post(requestData);
    return new TweetLikeResponse(data);
  }

  /**
   * Unlikes a tweet.
   * @param targetTweet The tweet to unlike
   * @returns A {@link TweetUnlikeResponse} object
   */
  async unlike(targetTweet: TweetResolvable): Promise<TweetUnlikeResponse> {
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'unlike');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DeleteTweetsLikeResponse = await this.client._api
      .users(loggedInUser.id)
      .likes(targetTweetID)
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
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'retweet');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUsersRetweetsJSONBody = {
      tweet_id: targetTweetID,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PostUsersRetweetsResponse = await this.client._api.users(loggedInUser.id).retweets.post(requestData);
    return new RetweetResponse(data);
  }

  /**
   * Removes the retweet of a tweet.
   * @param targetTweet The tweet whose retweet is to be removed
   * @returns A {@link RemovedRetweetResponse} object
   */
  async unRetweet(targetTweet: TweetResolvable): Promise<RemovedRetweetResponse> {
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'remove retweet');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DeleteUsersRetweetsResponse = await this.client._api
      .users(loggedInUser.id)
      .retweets(targetTweetID)
      .delete(requestData);
    return new RemovedRetweetResponse(data);
  }

  /**
   * Fetches users who have retweeted a tweet.
   * @param targetTweet The tweet whose retweeters are to be fetched
   * @returns A {@link Collection} of {@link User} objects
   */
  async fetchRetweetedBy(targetTweet: TweetResolvable): Promise<Collection<Snowflake, User>> {
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'remove retweet');
    const queryParameters = this.client.options.queryParameters;
    const query: GetTweetsRetweetingUsersQuery = {
      expansions: queryParameters?.userExpansions,
      'user.fields': queryParameters?.userFields,
      'tweet.fields': queryParameters?.tweetFields,
    };
    const requestData = new RequestData({ query });
    const data: GetTweetsRetweetingUsersResponse = await this.client._api
      .tweets(targetTweetID)
      .retweeted_by.get(requestData);
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
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', 'fetch liking users');
    const queryParameters = this.client.options.queryParameters;
    const query: GetTweetsLikingUsersQuery = {
      expansions: queryParameters?.userExpansions,
      'user.fields': queryParameters?.userFields,
      'tweet.fields': queryParameters?.tweetFields,
    };
    const requestData = new RequestData({ query });
    const data: GetTweetsLikingUsersResponse = await this.client._api
      .tweets(targetTweetID)
      .liking_users.get(requestData);
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

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleTweet(tweetID: Snowflake, options: FetchTweetOptions): Promise<Tweet> {
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
    const requestData = new RequestData({ query });
    const data: GetSingleTweetByIdResponse = await this.client._api.tweets(tweetID).get(requestData);
    return this.add(data.data.id, data, options.cacheAfterFetching);
  }

  async #fetchMultipleTweets(
    tweetIDs: Array<Snowflake>,
    options: FetchTweetsOptions,
  ): Promise<Collection<Snowflake, Tweet>> {
    const fetchedTweetCollection = new Collection<Snowflake, Tweet>();
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
    const requestData = new RequestData({ query });
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
    targetTweet: TweetResolvable,
    isHidden: boolean,
  ): Promise<TweetReplyHideUnhideResponse> {
    const targetTweetID = this.resolveID(targetTweet);
    if (!targetTweetID) throw new CustomError('TWEET_RESOLVE_ID', `${isHidden ? 'hide' : 'unhide'}`);
    const body: PutTweetReplyHideUnhideJSONBody = {
      hidden: isHidden,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PutTweetReplyHideUnhideResponse = await this.client._api.tweets(targetTweetID).hidden.put(requestData);
    return new TweetReplyHideUnhideResponse(data);
  }
}
