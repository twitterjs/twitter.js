import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { RequestData, Space, type Tweet } from '../structures';
import type { Client } from '../client';
import type {
	GETSpacesByCreatorIdsQuery,
	GETSpacesByCreatorIdsResponse,
	GETSpacesIdQuery,
	GETSpacesIdResponse,
	GETSpacesIdTweetsQuery,
	GETSpacesIdTweetsResponse,
	GETSpacesQuery,
	GETSpacesResponse,
	GETSpacesSearchQuery,
	GETSpacesSearchResponse,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link Space} objects and stores their cache
 */
export class SpaceManager extends BaseManager<string, SpaceResolvable, Space> {
	/**
	 * @param client The logged in {@link Client} instance
	 */
	constructor(client: Client) {
		super(client, Space);
	}

	/**
	 * Fetches one or more spaces.
	 * @param spaceOrSpaces The space or spaces to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Space} or a {@link Collection} of them
	 * @example
	 * const space = await client.spaces.fetch('1OdJrBwXgjXJX');
	 */
	async fetch<S extends SpaceResolvable | Array<SpaceResolvable>>(
		spaceOrSpaces: S,
		options?: FetchSpaceOrSpacesOptions<S>,
	): Promise<SpaceManagerFetchResult<S>> {
		if (Array.isArray(spaceOrSpaces)) {
			const spaceIds = spaceOrSpaces.map(space => {
				const spaceId = this.resolveId(space);
				if (!spaceId) throw new CustomError('SPACE_RESOLVE_ID', 'fetch');
				return spaceId;
			});
			// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
			return this.#fetchMultipleSpacesByIds(spaceIds, options);
		}
		const spaceId = this.resolveId(spaceOrSpaces);
		if (!spaceId) throw new CustomError('SPACE_RESOLVE_ID', 'fetch');
		// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
		return this.#fetchSingleSpaceById(spaceId, options);
	}

	/**
	 * Fetches live or scheduled spaces created by a user or users.
	 * @param creatorOrCreators The user or users whose created live or scheduled spaces are to be fetched
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link Space}
	 * @example
	 * // Fetch live or scheduled spaces created by a user
	 * const spaces = await client.spaces.fetchByCreators('1253316035878375424');
	 *
	 * // Fetch live or scheduled spaces created by multiple users
	 * const spaces = await client.spaces.fetchByCreators(['1253316035878375424', '6253282']);
	 */
	async fetchByCreators(
		creatorOrCreators: UserResolvable | Array<UserResolvable>,
		options?: FetchSpacesByCreatorsOptions,
	): Promise<Collection<string, Space>> {
		let userIds: Array<string>;
		if (Array.isArray(creatorOrCreators)) {
			userIds = creatorOrCreators.map(user => {
				const userId = this.client.users.resolveId(user);
				if (!userId) throw new CustomTypeError('USER_RESOLVE_ID', 'fetch spaces of');
				return userId;
			});
		} else {
			const userId = this.client.users.resolveId(creatorOrCreators);
			if (!userId) throw new CustomTypeError('USER_RESOLVE_ID', 'fetch spaces of');
			userIds = [userId];
		}
		const fetchedSpaces = new Collection<string, Space>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesByCreatorIdsQuery = {
			user_ids: userIds,
			expansions: queryParameters?.spaceExpansions,
			'user.fields': queryParameters?.userFields,
			'space.fields': queryParameters?.spaceFields,
		};
		const requestData = new RequestData({ query });
		const res: GETSpacesByCreatorIdsResponse = await this.client._api.spaces.by.creator_ids.get(requestData);
		if (res.meta.result_count === 0) return fetchedSpaces;
		const rawSpaces = res.data;
		const rawSpacesIncludes = res.includes;
		for (const rawSpace of rawSpaces) {
			const space = this._add(
				rawSpace.id,
				{ data: rawSpace, includes: rawSpacesIncludes },
				options?.cacheAfterFetching,
			);
			fetchedSpaces.set(space.id, space);
		}
		return fetchedSpaces;
	}

	/**
	 * Fetches spaces using search query.
	 * @param queryString Any text (including mentions and hashtags) present in the title of the spaces to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link Space}
	 * @example
	 * // Fetch all the spaces that have the term "Twitter" in their title
	 * const spaces = await client.spaces.search('Twitter');
	 *
	 * // Fetch all the live spaces that have the term "Twitter" in their title
	 * const spaces = await client.spaces.search('Twitter', { state: 'live' });
	 */
	async search(queryString: string, options?: SearchSpacesOptions): Promise<Collection<string, Space>> {
		const fetchedSpaces = new Collection<string, Space>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesSearchQuery = {
			query: queryString,
			expansions: queryParameters?.spaceExpansions,
			max_results: options?.maxResults,
			'space.fields': queryParameters?.spaceFields,
			state: options?.state,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETSpacesSearchResponse = await this.client._api.spaces.search.get(requestData);
		if (res.meta.result_count === 0) return fetchedSpaces;
		const rawSpaces = res.data;
		const rawSpacesIncludes = res.includes;
		for (const rawSpace of rawSpaces) {
			const space = this._add(
				rawSpace.id,
				{ data: rawSpace, includes: rawSpacesIncludes },
				options?.cacheAfterFetching,
			);
			fetchedSpaces.set(space.id, space);
		}
		return fetchedSpaces;
	}

	/**
	 * Fetches tweets shared in a space.
	 * @param space The space whose shared tweets are to be fetched
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link Tweet}
	 * @example
	 * const tweets = await client.spaces.fetchSharedTweets('1DXxyRYNejbKM');
	 */
	async fetchSharedTweets(
		space: SpaceResolvable,
		options?: FetchSpaceSharedTweetsOptions,
	): Promise<Collection<string, Tweet>> {
		const spaceId = this.resolveId(space);
		if (!spaceId) throw new CustomError('SPACE_RESOLVE_ID');
		const fetchedTweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesIdTweetsQuery = {
			expansions: queryParameters?.tweetExpansions,
			max_results: options?.maxResults,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETSpacesIdTweetsResponse = await this.client._api.spaces(spaceId).tweets.get(requestData);
		if (res.meta.result_count === 0) return fetchedTweets;
		const rawTweets = res.data;
		const rawTweetsIncludes = res.includes;
		for (const rawTweet of rawTweets) {
			const tweet = this.client.tweets._add(
				rawTweet.id,
				{ data: rawTweet, includes: rawTweetsIncludes },
				options?.cacheAfterFetching,
			);
			fetchedTweets.set(tweet.id, tweet);
		}
		return fetchedTweets;
	}

	/**
	 * Fetches a single space using its id.
	 * @param spaceId The id of the space to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Space}
	 */
	async #fetchSingleSpaceById(spaceId: string, options?: FetchSpaceOptions): Promise<Space> {
		if (!options?.skipCacheCheck) {
			const cachedSpace = this.cache.get(spaceId);
			if (cachedSpace) return cachedSpace;
		}
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesIdQuery = {
			expansions: queryParameters?.spaceExpansions,
			'space.fields': queryParameters?.spaceFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETSpacesIdResponse = await this.client._api.spaces(spaceId).get(requestData);
		return this._add(res.data.id, res, options?.cacheAfterFetching);
	}

	/**
	 * Fetches multiple spaces using their ids.
	 * @param spaceIds The ids of the spaces to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link Space}
	 */
	async #fetchMultipleSpacesByIds(
		spaceIds: Array<string>,
		options?: FetchSpacesOptions,
	): Promise<Collection<string, Space>> {
		const fetchedSpaces = new Collection<string, Space>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesQuery = {
			ids: spaceIds,
			expansions: queryParameters?.spaceExpansions,
			'space.fields': queryParameters?.spaceFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETSpacesResponse = await this.client._api.spaces.get(requestData);
		const rawSpaces = res.data;
		const rawSpacesIncludes = res.includes;
		for (const rawSpace of rawSpaces) {
			const space = this._add(
				rawSpace.id,
				{ data: rawSpace, includes: rawSpacesIncludes },
				options?.cacheAfterFetching,
			);
			fetchedSpaces.set(space.id, space);
		}
		return fetchedSpaces;
	}
}

/**
 * Options used to fetch tweets shared in a space
 */
export interface FetchSpaceSharedTweetsOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
	/**
	 * The maximum number of tweets to fetch
	 */
	maxResults?: number;
}

/**
 * Options used to fetch a single space
 */
export type FetchSpaceOptions = BaseFetchOptions;

/**
 * Options used to fetch multiple spaces
 */
export type FetchSpacesOptions = Omit<BaseFetchOptions, 'skipCacheCheck'>;

/**
 * Options used to fetch one or more spaces
 */
export type FetchSpaceOrSpacesOptions<S extends SpaceResolvable | Array<SpaceResolvable>> = S extends SpaceResolvable
	? FetchSpaceOptions
	: FetchSpacesOptions;

export type SpaceManagerFetchResult<S extends SpaceResolvable | Array<SpaceResolvable>> = S extends SpaceResolvable
	? Space
	: Collection<string, Space>;

/**
 * Options used to fetch live or scheduled spaces created by a user or users
 */
export type FetchSpacesByCreatorsOptions = Omit<BaseFetchOptions, 'skipCacheCheck'>;

/**
 * Options used to search spaces
 */
export interface SearchSpacesOptions extends Omit<BaseFetchOptions, 'skipCacheCheck'> {
	/**
	 * The state of the spaces to match
	 * @default 'all'
	 */
	state?: GETSpacesSearchQuery['state'];

	/**
	 * The number of maximum spaces to fetch
	 */
	maxResults?: number;
}
