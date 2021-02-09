'use strict';

/**
 * Holds meta information returned by paginated endpoints
 */
class Meta {
  constructor(data) {
    /**
     * Number of results in the response
     * @type {number}
     */
    this.resultCount = data.result_count ?? null;

    /**
     * Token to fetch the next page
     * @type {string}
     */
    this.nextToken = data.next_token ?? null;

    /**
     * Token to fetch the previous page
     * @type {number}
     */
    this.previousToken = data.previous_token ?? null;
  }
}

export default Meta;
