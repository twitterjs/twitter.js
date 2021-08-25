import type Tweet from '../structures/Tweet.js';
import type { ClientEvents } from '../util/Constants.js';
import type { RequestData } from '../structures/misc/Misc.js';
import type { ClientInUse, ClientUnionType, TweetResolvable, UserResolvable, SpaceResolvable } from './Types.js';
import type {
  MediaFieldsParameter,
  PlaceFieldsParameter,
  PollFieldsParameter,
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
}

export interface ClientEventsMapping<C extends ClientUnionType> {
  partialError: [partialError: Record<string, unknown>];
  ready: [client: ClientInUse<C>];
  sampledTweetCreate: [tweet: Tweet<C>];
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

/**
 * Options used to fetch a single space
 */
export interface FetchSpaceOptions<C extends ClientUnionType> extends BaseFetchOptions {
  /**
   * The space to fetch
   */
  space: SpaceResolvable<C>;
}

/**
 * Options used to fetch multiple spaces
 */
export interface FetchSpacesOptions<C extends ClientUnionType> extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
  /**
   * The spaces to fetch
   */
  spaces: Array<SpaceResolvable<C>>;
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
