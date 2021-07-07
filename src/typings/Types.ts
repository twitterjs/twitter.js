import type User from '../structures/User.js';
import type { Snowflake } from 'twitter-types';
import type Tweet from '../structures/Tweet.js';
import type Collection from '../util/Collection.js';
import type SimplifiedUser from '../structures/SimplifiedUser.js';
import type SimplifiedTweet from '../structures/SimplifiedTweet.js';
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

export type LiteralUnion<K extends T, T = string> = K | (T & { zz_ignore_me?: never });

export type UserManagerFetchResult<T extends FetchUserOptions | FetchUsersOptions> = T extends FetchUserOptions
  ? User
  : Collection<Snowflake, User>;

export type UserManagerFetchByUsernameResult<T extends FetchUserByUsernameOptions | FetchUsersByUsernamesOptions> =
  T extends FetchUserByUsernameOptions ? User : Collection<Snowflake, User>;

export type UserResolvable = User | SimplifiedUser | Snowflake;

export type TweetManagerFetchResult<T extends FetchTweetOptions | FetchTweetsOptions> = T extends FetchTweetOptions
  ? Tweet
  : Collection<Snowflake, Tweet>;

export type TweetResolvable = Tweet | SimplifiedTweet | Snowflake;
