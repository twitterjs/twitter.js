import type { ClientOptions } from '../typings/index.js';

/**
 * Default options with which the client gets initiated
 */
export const DefaultClientOptions: ClientOptions = {
  /**
   * The details about API
   */
  api: {
    version: 2,
    baseURL: 'https://api.twitter.com',
  },

  queryParameters: {
    userFields: [],
    tweetFields: [],
    mediaFields: [],
    placeFields: [],
    pollFields: [],
    tweetExpansions: [],
    userExpansions: [],
  },
};
