/**
 * Represents a mention entity
 */
class Mention {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * The point at which this mention starts
     * @type {number}
     */
    this.start = data.start;

    /**
     * The point at which this mention ends
     * @type {number}
     */
    this.end = data.end;

    /**
     * The username of the mentioned user
     * @type {string}
     */
    this.username = data.username;
  }
}

export default Mention;
