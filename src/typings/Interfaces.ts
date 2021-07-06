import type { RequestData } from '../structures/misc/Misc.js';
import type { TweetResolvable, UserResolvable } from './Types.js';
import type {
  APIMediaField,
  APIPlaceField,
  APIPollField,
  APITweetExpansion,
  APITweetField,
  APIUserExpansion,
  APIUserField,
} from 'twitter-types';

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

/**
 * The common optional options to provide while fetching a content
 */
export interface BaseFetchOptions {
  /**
   * Do not check for the existence of requested content in the cache, instead fetch it from the API directly
   */
  skipCacheCheck?: boolean;

  /**
   * Store the fetched content in the memory for later use
   */
  cacheAfterFetching?: boolean;

  /**
   * Make the request using user context auth
   */
  userContext?: boolean;
}

export interface ClientCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
  username: string;
}

export interface ClientEventsMapping {
  partialError: [partialError: Record<string, unknown>];
  ready: [];
}

/**
 * The options with which the client gets initiated
 */
export interface ClientOptions {
  /**
   * The options for the API
   */
  api?: ApiOptions;

  /**
   * The options for query of an API request
   */
  queryParameters?: QueryParameters;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorMessageBuilder = (...args: Array<any>) => string;

export interface ExtendedRequestData<Q, B> extends RequestData<Q, B> {
  route: string;
}

/**
 * Options used to fetch a user by its username
 */
export interface FetchUserByUsernameOptions extends BaseFetchOptions {
  /**
   * The username of the user to fetch
   */
  username: string;
}

/**
 * Options used to fetch users by their usernames
 */
export interface FetchUsersByUsernamesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The usernames of the users to fetch
   */
  usernames: Array<string>;
}

export interface FetchUserOptions extends BaseFetchOptions {
  /**
   * The user to fetch
   */
  user: UserResolvable;
}

export interface FetchUsersOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The users to fetch
   */
  users: Array<UserResolvable>;
}

export interface FetchTweetOptions extends BaseFetchOptions {
  /**
   * The tweet to fetch
   */
  tweet: TweetResolvable;
}

export interface FetchTweetsOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The tweets to fetch
   */
  tweets: Array<TweetResolvable>;
}

export interface QueryParameters {
  userFields?: Array<APIUserField>;
  tweetFields?: Array<APITweetField>;
  mediaFields?: Array<APIMediaField>;
  placeFields?: Array<APIPlaceField>;
  pollFields?: Array<APIPollField>;
  tweetExpansions?: Array<APITweetExpansion>;
  userExpansions?: Array<APIUserExpansion>;
}

export interface StructureConstructable<T> {
  // eslint-disable-next-line
  new(...args: any[]): T;
}

export interface TwitterjsErrorConstructor {
  // eslint-disable-next-line
  new(key: string, ...args: Array<unknown>): Error;
}
