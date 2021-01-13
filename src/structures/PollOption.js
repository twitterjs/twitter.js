'use strict';

/**
 * Represents an option in a Poll object
 */
class PollOption {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The serial position of the option in the poll
     * @type {Number}
     */
    this.position = data.position;

    /**
     * The text of the option
     * @type {string}
     */
    this.label = data.label;

    /**
     * The number of votes the option has got
     * @type {number}
     */
    this.votes = data.votes;
  }
}

export default PollOption;
