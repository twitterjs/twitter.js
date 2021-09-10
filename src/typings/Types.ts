import type { Collection } from '../util';
import type { Snowflake } from 'twitter-types';
import type {
  User,
  Tweet,
  Space,
  SimplifiedSpace,
  SimplifiedUser,
  SimplifiedTweet,
  FilteredTweetStreamRule,
} from '../structures';
import type {
  ClientEventsMapping,
  FetchTweetOptions,
  FetchTweetsOptions,
  FetchUserByUsernameOptions,
  FetchUserOptions,
  FetchUsersByUsernamesOptions,
  FetchUsersOptions,
  FetchSpaceOptions,
  FetchSpacesOptions,
  BaseCreateBookOptions,
} from './Interfaces';

export type ClientEventArgsType<K> = K extends keyof ClientEventsMapping
  ? ClientEventsMapping[K]
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
  any[];

export type ClientEventKeyType<K> = K extends keyof ClientEventsMapping
  ? LiteralUnion<K>
  : Exclude<K, keyof ClientEventsMapping>;

export type ClientEventListenerType<K> = K extends keyof ClientEventsMapping
  ? ClientEventsMapping[K]
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
  any[];

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

export type SpaceResolvable = Space | SimplifiedSpace | Snowflake;

export type SpaceManagerFetchResult<T extends FetchSpaceOptions | FetchSpacesOptions> = T extends FetchSpaceOptions
  ? Space
  : Collection<Snowflake, Space>;

export type FilteredTweetStreamRuleResolvable = FilteredTweetStreamRule | Snowflake;

/**
 * The options used to create a {@link BlocksBook} object for a user
 */
export type CreateBlocksBookOptions = BaseCreateBookOptions;
