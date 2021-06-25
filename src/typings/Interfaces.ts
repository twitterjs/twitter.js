import type { RequestData } from '../structures/Misc.js';
import {
  MediaFields,
  PlaceFields,
  PollFields,
  TweetExpansions,
  TweetFields,
  TweetResolvable,
  UserExpansions,
  UserFields,
} from './Types.js';

/**
 * The options related to the API version
 */
export interface ApiOptions {
  /**
   * Current default version of the API
   */
  version: number;

  /**
   * The base URL of the API
   */
  baseURL: string;
}

export interface ClientCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
  username: string;
}

/**
 * The options with which the client gets initiated
 */
export interface ClientOptions {
  /**
   * The options for the API
   */
  api?: ApiOptions;

  queryParameters?: QueryParameters;
}

export interface ExtendedRequestData<Q, B> extends RequestData<Q, B> {
  route: string;
}

export interface FetchTweetOptions {
  tweet: TweetResolvable;
  cache?: boolean;
  skipCacheCheck?: boolean;
  queryParameters?: QueryParameters;
}

export interface QueryParameters {
  userFields: Array<UserFields>;
  tweetFields: Array<TweetFields>;
  mediaFields: Array<MediaFields>;
  placeFields: Array<PlaceFields>;
  pollFields: Array<PollFields>;
  tweetExpansions: Array<TweetExpansions>;
  userExpansions: Array<UserExpansions>;
}

export interface StructureConstructable<T> {
  // eslint-disable-next-line
  new(...args: any[]): T;
}
