'use strict';

/**
 * Represents a poll in a tweet
 */
class Poll {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The ID of the poll object
     * @type {string}
     */
    this.id = data.id;

    /**
     * The options in the poll
     * @type {Object}
     */
    this.options = data.options;

    /**
     * The total duration of the poll in minutes
     * @type {number}
     */
    this.duration = data.duration_minutes;

    /**
     * The time at which the poll will end
     * @type {Date}
     */
    this.endDate = data.end_datetime;

    /**
     * The voting status of the poll
     * @type {string}
     */
    this.status = data.voting_status;
  }
}

export default Poll;
