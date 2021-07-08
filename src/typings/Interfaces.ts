import type { RequestData } from '../structures/misc/Misc.js';
import type { ClientUnionType, TweetResolvable, UserResolvable } from './Types.js';
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
 * The options for the API in use
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
   * Whether to skip cache check for the requested content and fetch from the API directly
   */
  skipCacheCheck?: boolean;

  /**
   * Whether to store the fetched content in cache for later use
   */
  cacheAfterFetching?: boolean;
}

export interface ClientCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  username: string;
}

export interface ClientEventsMapping {
  partialError: [partialError: Record<string, unknown>];
  ready: [];
}

/**
 * The options which the client gets initialized with
 */
export interface ClientOptions {
  /**
   * The options provided for the API
   */
  api?: ApiOptions;

  /**
   * The options provided for query of an API request
   */
  queryParameters?: QueryParameters;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorMessageBuilder = (...args: Array<any>) => string;

export interface ExtendedRequestData<Q, B> extends RequestData<Q, B> {
  route: string;
}

/**
 * Options used to fetch a single user by its username
 */
export interface FetchUserByUsernameOptions extends BaseFetchOptions {
  /**
   * The username of the user to fetch
   */
  username: string;
}

/**
 * Options used to fetch multiple users by their usernames
 */
export interface FetchUsersByUsernamesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The usernames of the users to fetch
   */
  usernames: Array<string>;
}

/**
 * Options used to fetch a single user
 */
export interface FetchUserOptions<C extends ClientUnionType> extends BaseFetchOptions {
  /**
   * The user to fetch
   */
  user: UserResolvable<C>;
}

/**
 * Options used to fetch multiple users
 */
export interface FetchUsersOptions<C extends ClientUnionType> extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The users to fetch
   */
  users: Array<UserResolvable<C>>;
}

/**
 * Options used to feth a single tweet
 */
export interface FetchTweetOptions<C extends ClientUnionType> extends BaseFetchOptions {
  /**
   * The tweet to fetch
   */
  tweet: TweetResolvable<C>;
}

/**
 * Options used to feth multiple tweets
 */
export interface FetchTweetsOptions<C extends ClientUnionType> extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The tweets to fetch
   */
  tweets: Array<TweetResolvable<C>>;
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
