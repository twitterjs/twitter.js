import type { ClientOptions } from '../typings/Interfaces.js';
import {
  userFields,
  tweetFields,
  mediaFields,
  placeFields,
  pollFields,
  tweetExpansions,
  userExpansions,
} from './QueryParameters.js';

export const ClientEvents = {
  PARTIAL_ERROR: 'partialError',
  READY: 'ready',
};

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
    userFields,
    tweetFields,
    mediaFields,
    placeFields,
    pollFields,
    tweetExpansions,
    userExpansions,
  },
};
