import Tweet from '../structures/Tweet.js';
import BaseManager from './BaseManager.js';
import Collection from '../util/Collection.js';
import { RequestData } from '../structures/misc/Misc.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import type Client from '../client/Client.js';
import type {
  FetchTweetOptions,
  FetchTweetsOptions,
  TweetManagerFetchResult,
  TweetResolvable,
} from '../typings/index.js';
import type {
  GetMultipleTweetsByIdsQuery,
  GetMultipleTweetsByIdsResponse,
  GetSingleTweetByIdQuery,
  GetSingleTweetByIdResponse,
} from 'twitter-types';

/**
 * Holds API methods for tweets and stores their cache
 */
export default class TweetManager extends BaseManager<TweetResolvable, Tweet> {
  constructor(client: Client) {
    super(client, Tweet);
  }

  /**
   * Fetches tweets from twitter
   * @param options The options for fetching tweets
   * @returns A {@link Tweet} or a {@link Collection} of them as a Promise
   */
  async fetch<T extends FetchTweetOptions | FetchTweetsOptions>(options: T): Promise<TweetManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'Object', true);
    if ('tweet' in options) {
      const tweetID = this.resolveID(options.tweet);
      if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID');
      return this._fetchSingleTweet(tweetID, options) as Promise<TweetManagerFetchResult<T>>;
    }
    if ('tweets' in options) {
      if (!Array.isArray(options.tweets)) throw new CustomTypeError('FETCH_TWEETS_TYPE');
      const tweetIDs = options.tweets.map(tweet => {
        const tweetID = this.resolveID(tweet);
        if (!tweetID) throw new CustomError('TWEET_RESOLVE_ID');
        return tweetID;
      });
      return this._fetchMultipleTweets(tweetIDs, options) as Promise<TweetManagerFetchResult<T>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  private async _fetchSingleTweet(tweetID: string, options: FetchTweetOptions): Promise<Tweet> {
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
    const requestData = new RequestData(query, null, options.userContext);
    const data: GetSingleTweetByIdResponse = await this.client._api.tweets(tweetID).get(requestData);
    return this.add(data.data.id, data, options.cacheAfterFetching);
  }

  private async _fetchMultipleTweets(
    tweetIDs: Array<string>,
    options: FetchTweetsOptions,
  ): Promise<Collection<string, Tweet>> {
    const fetchedTweetCollection = new Collection<string, Tweet>();
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
    const requestData = new RequestData(query, null, options.userContext);
    const data: GetMultipleTweetsByIdsResponse = await this.client._api.tweets.get(requestData);
    for (const rawTweet of data.data) {
      const tweet = this.add<GetSingleTweetByIdResponse>(
        rawTweet.id,
        { data: rawTweet, includes: data.includes },
        options.cacheAfterFetching,
      );
      fetchedTweetCollection.set(tweet.id, tweet);
    }
    return fetchedTweetCollection;
  }
}
