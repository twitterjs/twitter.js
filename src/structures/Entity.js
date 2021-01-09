'use strict';

import Url from './Url.js';
import Mention from './Mention.js';
import Hashtag from './Hashtag.js';
import Cashtag from './Cashtag.js';

/**
 * Holds all entities present in a user's profile
 */
class Entity {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The URL present in a user's bio
     * @type {?Url}
     */
    this.url = data?.url?.urls[0] ? new Url(data.url.urls[0]) : null;

    /**
     * The mentions present in the description of a user's bio
     * @type {?Mention}
     */
    this.mentions = data?.description?.mentions ? this._patchMentions(data.description.mentions) : null;

    /**
     * The hashtags present in the description of a user's bio
     * @type {?Hastag}
     */
    this.hashtags = data?.description?.hashtags ? this._patchHashtags(data.description.hashtags) : null;

    /**
     * The cashtags present in the description of a user's bio
     * @type {?Cashtag}
     */
    this.cashtags = data?.description?.cashtags ? this._patchCashtags(data.description.cashtags) : null;

    /**
     * The URLs present in the description of a user's bio
     * @type {?Url}
     */
    this.descriptionUrls = data?.description?.urls ? this._patchDescriptionUrls(data.description.urls) : null;
  }

  /**
   * Adds data to the mentions property of Entity
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
   * Adds data to the hashtags property of Entity
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
   * Adds data to the cashtags property of Entity
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

  /**
   * Adds data to the descriptionUrls property of Entity
   * @param {Array<Object>} descriptionUrls An array of raw descriptionUrls
   * @private
   * @returns {Array<Url>}
   */
  _patchDescriptionUrls(descriptionUrls) {
    const descriptionUrlsArray = [];
    descriptionUrls.forEach(descriptionUrl => {
      descriptionUrlsArray.push(new Url(descriptionUrl));
    });
    return descriptionUrlsArray;
  }
}

export default Entity;
