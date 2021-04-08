import BaseEntity from './BaseEntity.js';
import Url from './Url.js';

/**
 * Holds all entities present in a user's profile
 * @extends {BaseEntity}
 */
class UserEntity extends BaseEntity {
  /**
   * @param {Object} data
   */
  constructor(data) {
    super(data.description);
    /**
     * The URL present in a user's bio
     * @type {?Url}
     */
    this.urls = data?.url?.urls[0] ? new Url(data.url.urls[0]) : null;

    /**
     * The mentions present in the description of a user's bio
     * @type {?Mention}
     */

    /**
     * The hashtags present in the description of a user's bio
     * @type {?Hastag}
     */

    /**
     * The cashtags present in the description of a user's bio
     * @type {?Cashtag}
     */

    /**
     * The URLs present in the description of a user's bio
     * @type {?Url}
     */
    this.descriptionUrls = data?.description?.urls ? this._patchDescriptionUrls(data.description.urls) : null;
  }

  /**
   * Adds data to the descriptionUrls property
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

export default UserEntity;
