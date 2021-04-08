import BaseManager from './BaseManager.js';
import Tweet from '../structures/Tweet.js';
import { tweetBuilder } from '../util/StructureBuilder.js';
import { cleanFetchManyTweetsResponse } from '../util/ResponseCleaner.js';
import { Messages } from '../errors/ErrorMessages.js';
import { queryParameters } from '../util/Constants.js';
import APIOptions from '../structures/APIOptions.js';
import { ReplyState } from '../structures/MiscResponses.js';

/**
 * Holds API methods for tweets and stores their cache
 * @extends BaseManager
 */
class TweetManager extends BaseManager {
  /**
   * @param {Client} client The client that instantiated this Manager
   */
  constructor(client) {
    super(client, Tweet);

    /**
     * The cache of this Manager
     * @type {Collection<string, Tweet>}
     * @name TweetManager#cache
     */

    /**
     * Data tht resolves to a Tweet object. This can be:
     * * A Tweet object
     * * A tweet ID
     * @typedef {Tweet|string} TweetResolvable
     */
  }

  /**
   * Resolves a TweetResolvable to a Tweet object
   * @param {TweetResolvable} tweetResolvable An id or instance of a Tweet object
   * @returns {?Tweet}
   */

  /**
   * Resolves a TweetResolvable to a tweet ID
   * @param {TweetResolvable} tweetResolvable An id or instance of a Tweet object
   * @returns {?string}
   */

  /**
   * Options used to fetch a single tweet
   * @typedef {Object} FetchTweetOptions
   * @property {TweetResolvable} tweet The tweet to fetch
   * @property {boolean} [cache=true] Whether to cache the fetched tweet
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Options used to fetch multiple tweets
   * @typedef {Object} FetchTweetsOptions
   * @property {TweetResolvable|TweetResolvable[]} tweet The tweet(s) to fetch
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Fetches tweet(s) from Twitter
   * @param {TweetResolvable|FetchTweetOptions|FetchTweetsOptions} [options] Options to fetch tweet(s)
   * @returns {Promise<Tweet>|Promise<Collection<string, Tweet>>}
   * @example
   * // Fetch a single tweet using ID
   * client.tweets.fetch('12345567890')
   *  .then(console.log)
   *  .catch(console.error);
   */
  async fetch(options) {
    if (!options) throw new Error(Messages.TWEET_ID_INVALID);
    const tweetID = this.resolveID(options);
    if (tweetID) {
      const tweetData = await this._fetchSingle(options);
      const tweet = tweetBuilder(this.client, tweetData);
      return tweet;
    }
    if (options?.tweet) {
      if (Array.isArray(options.tweet)) {
        const tweetIds = [];
        options.tweet.forEach(tweetResolvable => {
          const tweetID = this.resolveID(tweetResolvable);
          if (tweetID) tweetIds.push(tweetID);
        });
        if (tweetIds.length) {
          const tweetsResponse = await this._fetchMany(tweetIds);
          const tweetsData = cleanFetchManyTweetsResponse(tweetsResponse);
          const tweetsCollection = tweetBuilder(this.client, tweetsData);
          return tweetsCollection;
        }
      } else {
        const tweetID = this.resolveID(options.tweet);
        if (tweetID) {
          const tweetData = await this._fetchSingle(options);
          const tweet = tweetBuilder(this.client, tweetData);
          return tweet;
        }
      }
    }
  }

  /**
   * Fetches a single tweet from Twitter
   * @param {string} query The ID of the tweet to fetch
   * @private
   */
  async _fetchSingle(query) {
    const queryParams = {
      expansions: queryParameters.expansions.tweet,
      'media.fields': queryParameters.mediaFields,
      'place.fields': queryParameters.placeFields,
      'poll.fields': queryParameters.pollFields,
      'tweet.fields': queryParameters.tweetFields,
      'user.fields': queryParameters.userFields,
    };
    const options = new APIOptions(queryParams, null, false);
    return this.client.api.tweets(query).get(options);
  }

  /**
   * Fetches upto 100 tweets from twitter
   * @param {Array<string>} query An array of IDs of tweets to fetch
   * @private
   */
  async _fetchMany(query) {
    const queryParams = {
      expansions: queryParameters.expansions.tweet,
      ids: query,
      'media.fields': queryParameters.mediaFields,
      'place.fields': queryParameters.placeFields,
      'poll.fields': queryParameters.pollFields,
      'tweet.fields': queryParameters.tweetFields,
      'user.fields': queryParameters.userFields,
    };
    const options = new APIOptions(queryParams, null, false);
    return this.client.api.tweets.get(options);
  }

  /**
   * Hides a reply to a tweet made by the user
   * @param {string} id The ID of the reply that is to be hidden
   * @returns {Promise<ReplyState>}
   */
  async hideReply(id) {
    const apiOptions = new APIOptions(null, { hidden: true }, true);
    const response = await this.client.api.tweets(id).hidden.put(apiOptions);
    return new ReplyState(response);
  }

  /**
   * Unhides a reply to a tweet made by the user
   * @param {string} id The ID of the reply that is to be unhidden
   * @returns {Promise<ReplyState>}
   */
  async unhideReply(id) {
    const apiOptions = new APIOptions(null, { hidden: false }, true);
    const response = await this.client.api.tweets(id).hidden.put(apiOptions);
    return new ReplyState(response);
  }
}

export default TweetManager;
