'use strict';

/**
 * A class for utility methods related to snowflake
 * @abstract
 */
class SnowflakeUtil {
  constructor() {
    throw new Error(`The ${this.constructor.name} class should not be instantiated.`);
  }

  /**
   * A Twitter snowflake
   * @typedef {string} Snowflake
   */

  /**
   * Checks whether something is a Snowflake or not
   * @param {Snowflake} data
   */
  isSnowflake(data) {
    // Will implement this later, for now just logging the data to hide the error prompt
    console.log(data);
  }

  /**
   * Checks whether a string is an ID or not
   * @param {string} data
   * @returns {boolean}
   */
  static isID(data) {
    if (typeof data !== 'string') return false;
    if (data.length === 0) return false;
    if (isNaN(data)) return false;
    return true;
  }
}

export default SnowflakeUtil;
