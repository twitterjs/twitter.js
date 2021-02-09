'use strict';

/**
 * Holds options and data that is needed for generating an API request
 */
class APIOptions {
  /**
   * @param {Object} query Query parameters that will be appeneded to the enpoint url
   * @param {Object} body Json parameters that will be sent to the API in the body
   * @param {boolean} userContext Whether the endpoint needs user context for authorization
   */
  constructor(query, body, userContext) {
    this.query = query;
    this.body = body;
    this.userContext = userContext;
  }
}

export default APIOptions;
