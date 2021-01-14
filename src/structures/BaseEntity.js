'use strict';

import Mention from './Mention.js';
import Hashtag from './Hashtag.js';
import Cashtag from './Cashtag.js';

/**
 * Base class for tweet and use entity classes
 */
class BaseEntity {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The mentions present in the text
     * @type {?Mention}
     */
    this.mentions = data?.mentions ? this._patchMentions(data.mentions) : null;

    /**
     * The hashtags present in the text
     * @type {?Hastag}
     */
    this.hashtags = data?.hashtags ? this._patchHashtags(data.hashtags) : null;

    /**
     * The cashtags present in the text
     * @type {?Cashtag}
     */
    this.cashtags = data?.cashtags ? this._patchCashtags(data.cashtags) : null;
  }

  /**
   * Adds data to the mentions property
   * @param {Array<Object>} mentions An array of raw mentions
   * @private
   * @returns {Array<Mention>}
   */
  _patchMentions(mentions) {
    const mentionsArray = [];
    mentions.forEach(mention => {
      mentionsArray.push(new Mention(mention));
    });
    return mentionsArray;
  }

  /**
   * Adds data to the hashtags property
   * @param {Array<Object>} hashtags An array of raw hastags
   * @private
   * @returns {Array<Hashtag>}
   */
  _patchHashtags(hashtags) {
    const hashtagsArray = [];
    hashtags.forEach(hashtag => {
      hashtagsArray.push(new Hashtag(hashtag));
    });
    return hashtagsArray;
  }

  /**
   * Adds data to the cashtags property
   * @param {Array<Object>} cashtags An array of raw cashtags
   * @private
   * @returns {Array<Cashtag>}
   */
  _patchCashtags(cashtags) {
    const cashtagsArray = [];
    cashtags.forEach(cashtag => {
      cashtagsArray.push(new Cashtag(cashtag));
    });
    return cashtagsArray;
  }
}

export default BaseEntity;
