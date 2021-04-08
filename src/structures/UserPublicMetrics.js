/**
 * Represents the public metrics of a user
 */
class UserPublicMetrics {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * Number of users who follow the user
     * @type {number}
     */
    this.followersCount = data.followers_count;

    /**
     * Number of users the user is following
     * @type {number}
     */
    this.followingCount = data.following_count;

    /**
     * Total number of tweets sent by the user
     * @type {number}
     */
    this.tweetCount = data.tweet_count;

    /**
     * Total number of list where the user is listed
     */
    this.listedCount = data.listed_count;
  }
}

export default UserPublicMetrics;
