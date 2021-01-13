'use strict';

/**
 * Represents public metrics in a tweet
 */
class TweetPublicMetrics {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The number of times the tweet got retweeted
     * @type {number}
     */
    this.retweetCount = data.retweet_count;

    /**
     * The number of replies the tweet has
     * @type {number}
     */
    this.replyCount = data.reply_count;

    /**
     * The number of likes the tweet has
     * @type {number}
     */
    this.likeCount = data.like_count;

    /**
     * The number of times the tweet got retweeted with a comment
     * @type {number}
     */
    this.quoteCount = data.quote_count;
  }
}

export default TweetPublicMetrics;
