import {
  MediaFields,
  PlaceFields,
  PollFields,
  TweetExpansions,
  TweetFields,
  UserExpansions,
  UserFields,
} from './QueryParameters.js';
import type { ClientOptions } from '../typings/Interfaces.js';

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
    userFields: UserFields,
    tweetFields: TweetFields,
    mediaFields: MediaFields,
    placeFields: PlaceFields,
    pollFields: PollFields,
    tweetExpansions: TweetExpansions,
    userExpansions: UserExpansions,
  },
};
