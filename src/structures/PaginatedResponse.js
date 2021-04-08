import Meta from './Meta.js';

/**
 * Holds data for paginated response sent by the api
 */
class PaginatedResponse {
  constructor(data, meta) {
    /**
     * Primary data in the response
     * @type {?Collection}
     */
    this.data = data ?? null;

    /**
     * Meta information about the response
     * @type {?Meta}
     */
    this.meta = meta ? new Meta(meta) : null;
  }
}

export default PaginatedResponse;
