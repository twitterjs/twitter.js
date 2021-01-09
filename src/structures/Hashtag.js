'use strict';

/**
 * Represents a hastag entity
 */
class Hashtag {
  /**
   * @param {Object}
   */
  constructor(data) {
    /**
     * The point at which the hashtag starts
     * @type {number}
     */
    this.start = data.start;

    /**
     * The point at which the hashtag ends
     * @type {number}
     */
    this.end = data.end;

    /**
     * The text of the hashtag
     * @type {string}
     */
    this.tag = data.tag;
  }
}

export default Hashtag;
