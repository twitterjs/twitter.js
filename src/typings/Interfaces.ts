import type { Client } from '../client';
import type { ClientEvents } from '../util';
import type { Tweet, RequestData } from '../structures';
import type { TweetResolvable, UserResolvable, SpaceResolvable } from './Types';
import type {
  Granularity,
  MediaFieldsParameter,
  PlaceFieldsParameter,
  PollFieldsParameter,
  Snowflake,
  SpaceExpansionsParameter,
  SpaceFieldsParameter,
  TweetExpansionsParameter,
  TweetFieldsParameter,
  UserExpansionsParameter,
  UserFieldsParameter,
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

export interface ClientCredentialsInterface {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  username: string;
  bearerToken: string;
}

export interface ClientEventsMapping {
  partialError: [partialError: Record<string, unknown>];
  ready: [client: Client];
  sampledTweetCreate: [tweet: Tweet];
  filteredTweetCreate: [tweet: Tweet];
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

  /**
   * The options for selecting what events should be fired
   */
  events: Array<keyof typeof ClientEvents>;
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
export interface FetchUserOptions extends BaseFetchOptions {
  /**
   * The user to fetch
   */
  user: UserResolvable;
}

/**
 * Options used to fetch multiple users
 */
export interface FetchUsersOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The users to fetch
   */
  users: Array<UserResolvable>;
}

/**
 * Options used to feth a single tweet
 */
export interface FetchTweetOptions extends BaseFetchOptions {
  /**
   * The tweet to fetch
   */
  tweet: TweetResolvable;
}

/**
 * Options used to feth multiple tweets
 */
export interface FetchTweetsOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The tweets to fetch
   */
  tweets: Array<TweetResolvable>;
}

/**
 * Options used to fetch a single space
 */
export interface FetchSpaceOptions extends BaseFetchOptions {
  /**
   * The space to fetch
   */
  space: SpaceResolvable;
}

/**
 * Options used to fetch multiple spaces
 */
export interface FetchSpacesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The spaces to fetch
   */
  spaces: Array<SpaceResolvable>;
}

/**
 * Options used to fetch spaces using creator ids
 */
export interface FetchSpacesByCreatorIdsOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The creators whose spaces are to be fetched
   */
  users: Array<UserResolvable>;
}

/**
 * Options used to search spaces
 */
export interface SearchSpacesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  query: string;
  state: 'live' | 'scheduled';
  maxResults?: number;
}

export interface QueryParameters {
  userFields?: Array<UserFieldsParameter>;
  tweetFields?: Array<TweetFieldsParameter>;
  spaceFields?: Array<SpaceFieldsParameter>;
  mediaFields?: Array<MediaFieldsParameter>;
  placeFields?: Array<PlaceFieldsParameter>;
  pollFields?: Array<PollFieldsParameter>;
  tweetExpansions?: Array<TweetExpansionsParameter>;
  userExpansions?: Array<UserExpansionsParameter>;
  spaceExpansions?: Array<SpaceExpansionsParameter>;
}

export interface StructureConstructable<T> {
  // eslint-disable-next-line
  new(...args: any[]): T;
}

export interface TwitterjsErrorConstructor {
  // eslint-disable-next-line
  new(key: string, ...args: Array<unknown>): Error;
}

export interface SearchTweetsBookCreateOptions {
  query: string;

  /**
   * The maximum number of tweets to fetch per page. Must be between `10` and `100`, inclusive
   */
  maxResultsPerPage?: number;
  startTime?: Date;
  endTime?: Date;
  sinceTweet?: TweetResolvable;
  untilTweet?: TweetResolvable;
}

export interface CountTweetsBookCreateOptions {
  query: string;
  startTime?: Date;
  endTime?: Date;
  granularity?: Granularity;
  sinceTweet?: TweetResolvable;
  untilTweet?: TweetResolvable;
}

/**
 * The options used to add a new filtered tweet stream rule
 */
export interface FilteredTweetStreamAddRuleOptions {
  /**
   * The value of the rule
   */
  value: string;

  /**
   * The label of the rule
   */
  tag?: string;
}

export interface RequestDataOptions<Q, B> {
  /**
   * The query for the request
   */
  query?: Q;

  /**
   * The body for the request
   */
  body?: B;

  /**
   * Whether the request results in a persisent http connection
   */
  isStreaming?: boolean;

  /**
   * Whether the request should be authorized with user context authorization
   */
  isUserContext?: boolean;
}

/**
 * The options used to create a {@link BlocksBook} object for a user
 */
export interface CreateBlocksBookOptions {
  /**
   * The ID of the user to create blocks book for
   */
  userId: Snowflake;

  /**
   * The maximum number of users to fetch per page
   */
  maxResultsPerPage?: number;
}

/**
 * The options used to fetch users blocked by the authorized user
 */
export interface FetchBlocksOptions {
  /**
   * The maximum number of users to fetch per page
   */
  maxResultsPerPage?: number;
}
