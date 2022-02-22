import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomTypeError } from '../errors';
import { RequestData, Space, type Tweet } from '../structures';
import type { Client } from '../client';
import type {
	FetchSpaceOptions,
	FetchSpacesByCreatorIdsOptions,
	FetchSpaceSharedTweetsOptions,
	FetchSpacesOptions,
	SearchSpacesOptions,
	SpaceManagerFetchResult,
	SpaceResolvable,
	UserResolvable,
} from '../typings';
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
	 * Fetches spaces from twitter.
	 * @param options The options for fetching spaces
	 * @returns A {@link Space} or a {@link Collection} of them as a `Promise`
	 * @example
	 * const space = await client.spaces.fetch({ space: '1OdJrBwXgjXJX' });
	 * console.log(`Fetched a space named: ${space.title}`); // Fetched a space named: Test Twitter Spaces
	 */
	async fetch<T extends FetchSpaceOptions | FetchSpacesOptions>(options: T): Promise<SpaceManagerFetchResult<T>> {
		if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
		if ('space' in options) {
			const spaceId = this.resolveId(options.space);
			if (!spaceId) throw new CustomTypeError('SPACE_RESOLVE_ID');
			return this.#fetchSingleSpace(spaceId, options) as Promise<SpaceManagerFetchResult<T>>;
		}
		if ('spaces' in options) {
			if (!Array.isArray(options.spaces)) throw new CustomTypeError('INVALID_TYPE', 'spaces', 'array', true);
			const spaceIds = options.spaces.map(space => {
				const spaceId = this.resolveId(space);
				if (!spaceId) throw new CustomTypeError('SPACE_RESOLVE_ID');
				return spaceId;
			});
			return this.#fetchMultipleSpaces(spaceIds, options) as Promise<SpaceManagerFetchResult<T>>;
		}
		throw new CustomTypeError('INVALID_FETCH_OPTIONS');
	}

	/**
	 * Fetches live or scheduled spaces of users.
	 * @param options The options for fetching spaces
	 * @returns A {@link Collection} of {@link Space} as a `Promise`
	 * @example
	 * // Fetch spaces of a user using id
	 * const spaces = await client.spaces.fetchByCreators({ users: ['1253316035878375424'] });
	 *
	 * // Fetch spaces of a user using user object
	 * const creator = await client.users.fetchByUsername({ username: 'iShiibi' });
	 * const spaces = await client.spaces.fetchByCreators({ users: [creator] });
	 *
	 * // Fetch spaces of multiple users
	 * const spaces = await client.spaces.fetchByCreators({ users: ['1253316035878375424', '6253282'] });
	 */
	async fetchByCreators(options: FetchSpacesByCreatorIdsOptions): Promise<Collection<string, Space>> {
		if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
		if (!Array.isArray(options.users)) throw new CustomTypeError('INVALID_TYPE', 'users', 'array', true);
		const fetchedSpaces = new Collection<string, Space>();
		const userIds = options.users.map(user => {
			const userId = this.client.users.resolveId(user as UserResolvable);
			if (!userId) throw new CustomTypeError('USER_RESOLVE_ID', 'fetch spaces of');
			return userId;
		});
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesByCreatorIdsQuery = {
			user_ids: userIds,
			expansions: queryParameters?.spaceExpansions,
			'user.fields': queryParameters?.userFields,
			'space.fields': queryParameters?.spaceFields,
		};
		const requestData = new RequestData({ query });
		const data: GETSpacesByCreatorIdsResponse = await this.client._api.spaces.by.creator_ids.get(requestData);
		if (data.meta.result_count === 0) return fetchedSpaces;
		const rawSpaces = data.data;
		const rawSpacesIncludes = data.includes;
		for (const rawSpace of rawSpaces) {
			const space = this._add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
			fetchedSpaces.set(space.id, space);
		}
		return fetchedSpaces;
	}

	/**
	 * Fetches spaces using search query.
	 * @param options Option used to search spaces
	 * @returns A {@link Collection} of {@link Space} as a `Promise`
	 * @example
	 * const spaces = await client.spaces.search({ query: 'Twitter', state: 'live' });
	 */
	async search(options: SearchSpacesOptions): Promise<Collection<string, Space>> {
		const fetchedSpaces = new Collection<string, Space>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesSearchQuery = {
			query: options.query,
			expansions: queryParameters?.spaceExpansions,
			max_results: options.maxResults,
			'space.fields': queryParameters?.spaceFields,
			state: options.state,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const data: GETSpacesSearchResponse = await this.client._api.spaces.search.get(requestData);
		if (data.meta.result_count === 0) return fetchedSpaces;
		const rawSpaces = data.data;
		const rawSpacesIncludes = data.includes;
		for (const rawSpace of rawSpaces) {
			const space = this._add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
			fetchedSpaces.set(space.id, space);
		}
		return fetchedSpaces;
	}

	/**
	 * Fetches tweets shared in a space.
	 *
	 * // TODO: This needs `OAuth 2.0 Authorization Code with PKCE` auth method support
	 * @param options Option for fetching tweets shared in a space
	 * @returns A {@link Collection} of {@link Tweet}
	 */
	async fetchSharedTweets(options: FetchSpaceSharedTweetsOptions): Promise<Collection<string, Tweet>> {
		if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
		const spaceId = this.resolveId(options.space);
		if (!spaceId) throw new CustomTypeError('SPACE_RESOLVE_ID');
		const fetchedTweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesIdTweetsQuery = {
			expansions: queryParameters?.tweetExpansions,
			max_results: options.maxResults,
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
				options.cacheAfterFetching,
			);
			fetchedTweets.set(tweet.id, tweet);
		}
		return fetchedTweets;
	}

	/**
	 * Fetches a single space by id.
	 * @param spaceId The id of the space to fetch
	 * @param options The options for fetching the space
	 * @returns A {@link Space} as a `Promise`
	 */
	async #fetchSingleSpace(spaceId: string, options: FetchSpaceOptions): Promise<Space> {
		if (!options.skipCacheCheck) {
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
		const data: GETSpacesIdResponse = await this.client._api.spaces(spaceId).get(requestData);
		return this._add(data.data.id, data, options.cacheAfterFetching);
	}

	/**
	 * Fetches multiple spaces by ids
	 * @param spaceIds The ids of the spaces to fetch
	 * @param options The options for fetching the spaces
	 * @returns A {@link Collection} of {@link Space} as a `Promise`
	 */
	async #fetchMultipleSpaces(spaceIds: Array<string>, options: FetchSpacesOptions): Promise<Collection<string, Space>> {
		const fetchedSpaces = new Collection<string, Space>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETSpacesQuery = {
			ids: spaceIds,
			expansions: queryParameters?.spaceExpansions,
			'space.fields': queryParameters?.spaceFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const data: GETSpacesResponse = await this.client._api.spaces.get(requestData);
		const rawSpaces = data.data;
		const rawSpacesIncludes = data.includes;
		for (const rawSpace of rawSpaces) {
			const space = this._add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
			fetchedSpaces.set(space.id, space);
		}
		return fetchedSpaces;
	}
}
