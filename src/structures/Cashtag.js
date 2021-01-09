'use strict';

/**
 * Represents a cashtag entity
 */
class Cashtag {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The point at which the cashtag starts
     * @type {number}
     */
    this.start = data.start;

    /**
     * The point at which the cashtag ends
     * @type {number}
     */
    this.end = data.end;

    /**
     * The text of the cashtag
     * @type {string}
     */
    this.tag = data.tag;
  }
}

export default Cashtag;
