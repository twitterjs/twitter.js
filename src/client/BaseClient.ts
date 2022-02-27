import { EventEmitter } from 'node:events';
import { mergeDefault, defaultClientOptions, type Collection, ClientEvents } from '../util';
import type { Tweet, MatchingRule } from '../structures';
import type {
	APIUserFieldsParameterType,
	APITweetFieldsParameterType,
	APISpaceFieldsParameterType,
	APIMediaFieldsParameterType,
	APIPlaceFieldsParameterType,
	APIPollFieldsParameterType,
	APIListFieldsParameterType,
	APITweetExpansionsParameterType,
	APIUserExpansionsParameterType,
	APISpaceExpansionsParameterType,
	APIListExpansionsParameterType,
} from 'twitter-types';
import type { Client } from './Client';

/**
 * The base client class
 */
export class BaseClient extends EventEmitter {
	/**
	 * The options passed to the client during initialization
	 */
	options: ClientOptions;

	/**
	 * @param options The options to initialize the client with
	 */
	constructor(options?: ClientOptions) {
		super();

		this.options = typeof options === 'object' ? mergeDefault(defaultClientOptions, options) : defaultClientOptions;
	}

	override on<K extends keyof ClientEventsMapping | symbol>(
		event: ClientEventKeyType<K>,
		listener: (...args: ClientEventListenerType<K>) => void,
	): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		super.on(event, listener as (...args: any[]) => void);
		return this;
	}

	override once<K extends keyof ClientEventsMapping | symbol>(
		event: ClientEventKeyType<K>,
		listener: (...args: ClientEventListenerType<K>) => void,
	): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		super.on(event, listener as (...args: any[]) => void);
		return this;
	}

	override emit<K extends keyof ClientEventsMapping | symbol>(
		event: ClientEventKeyType<K>,
		...args: ClientEventArgsType<K>
	): boolean {
		return super.emit(event, ...args);
	}
}

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

export interface ClientEventsMapping {
	filteredTweetCreate: [tweet: Tweet, matchingRules: Collection<string, MatchingRule>];
	partialError: [partialError: Record<string, unknown>];
	ready: [client: Client];
	sampledTweetCreate: [tweet: Tweet];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientEventArgsType<K> = K extends keyof ClientEventsMapping ? ClientEventsMapping[K] : any[];

export type ClientEventKeyType<K> = K extends keyof ClientEventsMapping
	? LiteralUnion<K>
	: Exclude<K, keyof ClientEventsMapping>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClientEventListenerType<K> = K extends keyof ClientEventsMapping ? ClientEventsMapping[K] : any[];

export type LiteralUnion<K extends T, T = string> = K | (T & { zz_ignore_me?: never });

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

export interface QueryParameters {
	userFields?: Array<APIUserFieldsParameterType>;
	tweetFields?: Array<APITweetFieldsParameterType>;
	spaceFields?: Array<APISpaceFieldsParameterType>;
	mediaFields?: Array<APIMediaFieldsParameterType>;
	placeFields?: Array<APIPlaceFieldsParameterType>;
	pollFields?: Array<APIPollFieldsParameterType>;
	listFields?: Array<APIListFieldsParameterType>;
	tweetExpansions?: Array<APITweetExpansionsParameterType>;
	userExpansions?: Array<APIUserExpansionsParameterType>;
	spaceExpansions?: Array<APISpaceExpansionsParameterType>;
	listExpansions?: Array<APIListExpansionsParameterType>;
}
