import BaseEntity from './BaseEntity.js';
import Url from './Url.js';

/**
 * Holds entity present in a tweet
 * @extends {BaseEntity}
 */
class TweetEntity extends BaseEntity {
  /**
   * @param {Object} data
   */
  constructor(data) {
    super(data);

    /**
     * The mentions present in the tweet
     * @type {?Mention}
     */

    /**
     * The hashtags present in the tweet
     * @type {?Hastag}
     */

    /**
     * The cashtags present in the tweet
     * @type {?Cashtag}
     */

    /**
     * The URLs present in the tweet
     * @type {?Url}
     */
    this.urls = data?.urls ? this._patchUrls(data.urls) : null;
  }

  /**
   * Adds data to the urls property
   * @param {Array<Object>} urls An array of raw urls
   * @private
   * @returns {Array<Url>}
   */
  _patchUrls(urls) {
    const urlsArray = [];
    urls.forEach(url => {
      urlsArray.push(new Url(url));
    });
    return urlsArray;
  }
}

export default TweetEntity;
