import type { Collection } from '../util';
import type { FetchFilteredStreamRuleOptions, FetchFilteredStreamRulesOptions, TweetCreateOptions } from './Interfaces';
import type {
	User,
	Tweet,
	Space,
	SimplifiedSpace,
	SimplifiedUser,
	SimplifiedTweet,
	FilteredStreamRule,
	List,
	SimplifiedList,
} from '../structures';
import type { ClientEventsMapping } from './Interfaces';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientEventArgsType<K> = K extends keyof ClientEventsMapping ? ClientEventsMapping[K] : any[];

export type ClientEventKeyType<K> = K extends keyof ClientEventsMapping
	? LiteralUnion<K>
	: Exclude<K, keyof ClientEventsMapping>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientEventListenerType<K> = K extends keyof ClientEventsMapping ? ClientEventsMapping[K] : any[];

export type LiteralUnion<K extends T, T = string> = K | (T & { zz_ignore_me?: never });

export type UserResolvable = User | SimplifiedUser | Tweet | SimplifiedTweet | string;

export type TweetResolvable = Tweet | SimplifiedTweet | string;

export type SpaceResolvable = Space | SimplifiedSpace | string;

export type ListResolvable = List | SimplifiedList | string;

export type FilteredStreamRuleResolvable = FilteredStreamRule | string;

export type FilteredStreamRuleManagerFetchResult<
	T extends FetchFilteredStreamRuleOptions | FetchFilteredStreamRulesOptions,
> = T extends undefined | FetchFilteredStreamRulesOptions ? Collection<string, FilteredStreamRule> : FilteredStreamRule;

/**
 * Options used to reply to a tweet
 */
export type TweetReplyOptions = Omit<TweetCreateOptions, 'inReplyToTweet'>;

/**
 * Options used to quote a tweet
 */
export type TweetQuoteOptions = Omit<TweetCreateOptions, 'quoteTweet'>;
