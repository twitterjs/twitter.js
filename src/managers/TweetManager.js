'use strict';

import BaseManager from './BaseManager.js';
import Tweet from '../structures/Tweet.js';

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
     * @type {Collection<Snowflake, Tweet>}
     * @name TweetManager#cache
     */

    /**
     * Data tht resolves to a Tweet object. This can be:
     * * A Tweet object
     * * A tweet ID
     * @typedef {Tweet|Snowflake} TweetResolvable
     */
  }

  /**
   * Resolves a TweetResolvable to a Tweet object
   * @param {TweetResolvable} tweetResolvable An id or instance of a Tweet object
   * @returns {?Tweet}
   */

  /**
   * Resolves a TweetResolvable to a Tweet object
   * @param {TweetResolvable} tweetResolvable An id or instance of a Tweet object
   * @returns {?Snowflake}
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
   * @typedef {Object} FetchTweetsOption
   * @property {TweetResolvable|TweetResolvable[]} tweet The tweet(s) to fetch
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Fetches tweet(s) from Twitter
   * @param {TweetResolvable|FetchTweetOptions|FetchTweetsOption} [options] Options to fetch tweet(s)
   * @returns {Promise<Tweet>|Promise<Collection<Snowflake, Tweet>>}
   * @example
   * // Fetch a single tweet using ID
   * client.tweets.fetch('12345567890')
   *  .then(console.log)
   *  .catch(console.error);
   */
  async fetch(options) {
    const tweetID = this.resolveID(options);
    if (tweetID) return this._fetchSingle(options);
    if (options.tweet) {
      if (Array.isArray(options.tweet)) {
        const tweetIds = [];
        options.tweet.forEach(tweetResolvable => {
          const tweetID = this.resolveID(tweetResolvable);
          if (tweetID) tweetIds.push(tweetID);
        });
        if (tweetIds.length) return this._fetchMany(tweetIds);
      } else {
        const tweetID = this.resolveID(options.tweet);
        if (tweetID) return this._fetchSingle(tweetID);
      }
    }
  }

  /**
   * Fetches a single tweet from Twitter
   * @param {Snowflake} query The ID of the tweet to fetch
   * @private
   */
  async _fetchSingle(query) {
    return this.client.rest.fetchTweetById(query);
  }

  /**
   * Fetches upto 100 tweets from twitter
   * @param {Array<Snowflake>} query An array of IDs of tweets to fetch
   * @private
   */
  async _fetchMany(query) {
    return this.client.rest.fetchTweetsByIds(query);
  }
}

export default TweetManager;
