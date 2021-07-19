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
  SAMPLED_TWEET_CREATE: 'sampledTweetCreate',
};

/**
 * The default options which the client gets initialized with
 */
export const DefaultClientOptions: ClientOptions = {
  /**
   * The options for the API to use
   */
  api: {
    version: 2,
    baseURL: 'https://api.twitter.com',
  },

  /**
   * The parameters to pass in the query of a request
   */
  queryParameters: {
    userFields: UserFields,
    tweetFields: TweetFields,
    mediaFields: MediaFields,
    placeFields: PlaceFields,
    pollFields: PollFields,
    tweetExpansions: TweetExpansions,
    userExpansions: UserExpansions,
  },

  /**
   * The events that the client opted-in for
   */
  events: [],
};
