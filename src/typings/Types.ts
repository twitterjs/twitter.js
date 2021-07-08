import type User from '../structures/User.js';
import type { Snowflake } from 'twitter-types';
import type Tweet from '../structures/Tweet.js';
import type Collection from '../util/Collection.js';
import type BearerClient from '../client/BearerClient.js';
import type SimplifiedUser from '../structures/SimplifiedUser.js';
import type SimplifiedTweet from '../structures/SimplifiedTweet.js';
import type UserContextClient from '../client/UserContextClient.js';
import type {
  ClientEventsMapping,
  FetchTweetOptions,
  FetchTweetsOptions,
  FetchUserByUsernameOptions,
  FetchUserOptions,
  FetchUsersByUsernamesOptions,
  FetchUsersOptions,
} from './Interfaces.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientEventArgsType<K> = K extends keyof ClientEventsMapping ? ClientEventsMapping[K] : any[];

export type ClientEventKeyType<K> = K extends keyof ClientEventsMapping
  ? LiteralUnion<K>
  : Exclude<K, keyof ClientEventsMapping>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientEventListenerType<K> = K extends keyof ClientEventsMapping ? ClientEventsMapping[K] : any[];

export type ClientInUse<T extends UserContextClient | BearerClient> = T extends UserContextClient
  ? UserContextClient
  : BearerClient;

export type ClientUnionType = UserContextClient | BearerClient;

export type LiteralUnion<K extends T, T = string> = K | (T & { zz_ignore_me?: never });

export type UserManagerFetchResult<
  T extends FetchUserOptions<ClientUnionType> | FetchUsersOptions<ClientUnionType>,
  C extends ClientUnionType,
  // eslint-disable-next-line prettier/prettier
  > = T extends FetchUserOptions<ClientUnionType> ? User<C> : Collection<Snowflake, User<C>>;

export type UserManagerFetchByUsernameResult<
  T extends FetchUserByUsernameOptions | FetchUsersByUsernamesOptions,
  C extends ClientUnionType,
  // eslint-disable-next-line prettier/prettier
  > = T extends FetchUserByUsernameOptions ? User<C> : Collection<Snowflake, User<C>>;

export type UserResolvable<C extends ClientUnionType> = User<C> | SimplifiedUser<C> | Snowflake;

export type TweetManagerFetchResult<
  T extends FetchTweetOptions<ClientUnionType> | FetchTweetsOptions<ClientUnionType>,
  C extends ClientUnionType,
  // eslint-disable-next-line prettier/prettier
  > = T extends FetchTweetOptions<ClientUnionType> ? Tweet<C> : Collection<Snowflake, Tweet<C>>;

export type TweetResolvable<C extends ClientUnionType> = Tweet<C> | SimplifiedTweet<C> | Snowflake;
