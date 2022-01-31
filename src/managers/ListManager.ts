import { BaseManager } from './BaseManager';
import { List, RequestData } from '../structures';
import { CustomError, CustomTypeError } from '../errors';
import type { Client } from '../client';
import type {
	CreateListOptions,
	ListResolvable,
	UpdateListOptions,
	UserResolvable,
	FetchListOptions,
} from '../typings';
import type {
	DELETEListsIdMembersUserIdResponse,
	DELETEListsIdResponse,
	DELETEUsersIdFollowedListsListIdResponse,
	DELETEUsersIdPinnedListsListIdResponse,
	GETListsIdQuery,
	GETListsIdResponse,
	POSTListsIdMembersJSONBody,
	POSTListsIdMembersResponse,
	POSTListsJSONBody,
	POSTListsResponse,
	POSTUsersIdFollowedListsJSONBody,
	POSTUsersIdFollowedListsResponse,
	POSTUsersIdPinnedListsJSONBody,
	POSTUsersIdPinnedListsResponse,
	PUTListsIdJSONBody,
	PUTListsIdResponse,
	Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link List} objects and stores their cache
 */
export class ListManager extends BaseManager<Snowflake, ListResolvable, List> {
	/**
	 * @param client The logged in {@link Client} instance
	 */
	constructor(client: Client) {
		super(client, List);
	}

	/**
	 * Creates a new list.
	 * @param options The options for creating the list
	 * @returns An object containing `id` and `name` of the created list
	 * @example
	 * const data = await client.lists.create({ name: 'Twitter.js Community', description: 'A nice place' });
	 * console.log(data); // { id: '1487049903255666689', name: 'Twitter.js Community' }
	 */
	async create(options: CreateListOptions): Promise<POSTListsResponse['data']> {
		if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
		const body: POSTListsJSONBody = {
			name: options.name,
			description: options.description,
			private: options.private,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTListsResponse = await this.client._api.lists.post(requestData);
		return res.data;
	}

	/**
	 * Fetches a list from Twitter.
	 * @param options The options for fetching list
	 * @returns A {@link List} as a `Promise`
	 * @example
	 * const list = await client.lists.fetch({ list: '1487049903255666689' });
	 * console.log(`Fetched a list named: ${list.name}`); // Fetched a list named: Twitter.js Community
	 */
	async fetch(options: FetchListOptions): Promise<List> {
		if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
		const listId = this.resolveId(options.list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'fetch');
		return this.#fetchSingleList(listId, options);
	}

	/**
	 * Deletes a list.
	 * @param list The list to delete
	 * @returns An object containing the `deleted` field
	 * @example
	 * const data = await client.lists.delete('1487090844578377729');
	 * console.log(data); // { deleted: true }
	 */
	async delete(list: ListResolvable): Promise<DELETEListsIdResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'delete');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEListsIdResponse = await this.client._api.lists(listId).delete(requestData);
		return res.data;
	}

	/**
	 * Updates a lists.
	 * @param list The list to update
	 * @param options The options for updating the list
	 * @returns An object containing the `updated` field
	 * @example
	 * const data = await client.lists.update('1487049903255666689', { description: 'A nice place for everyone' });
	 * console.log(data); // { updated: true }
	 */
	async update(list: ListResolvable, options: UpdateListOptions): Promise<PUTListsIdResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'update');
		if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
		const body: PUTListsIdJSONBody = {
			name: options.name,
			description: options.description,
			private: options.private,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: PUTListsIdResponse = await this.client._api.lists(listId).put(requestData);
		return res.data;
	}

	/**
	 * Adds a member to a list.
	 * @param list The list to add the member to
	 * @param user The user to add as a member of the list
	 * @returns An object containing the `is_member` field
	 * @example
	 * const user = await client.users.fetchByUsername({ username: 'iShiibi' });
	 * const data = await client.lists.addMember('1487049903255666689', user);
	 * console.log(data); // { is_member: true }
	 */
	async addMember(list: ListResolvable, user: UserResolvable): Promise<POSTListsIdMembersResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'add member to');
		const userId = this.client.users.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'add to the list');
		const body: POSTListsIdMembersJSONBody = {
			user_id: userId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTListsIdMembersResponse = await this.client._api.lists(listId).members.post(requestData);
		return res.data;
	}

	/**
	 * Removes a member from a list.
	 * @param list The list to remove the member from
	 * @param member The member to remove from the list
	 * @returns An object containing the `is_member` field
	 * @example
	 * const user = await client.users.fetchByUsername({ username: 'iShiibi' });
	 * const data = await client.lists.removeMember('1487049903255666689', user);
	 * console.log(data); // { is_member: false }
	 */
	async removeMember(
		list: ListResolvable,
		member: UserResolvable,
	): Promise<DELETEListsIdMembersUserIdResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'remove the member from');
		const userId = this.client.users.resolveId(member);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'remove from the list');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEListsIdMembersUserIdResponse = await this.client._api
			.lists(listId)
			.members(userId)
			.delete(requestData);
		return res.data;
	}

	/**
	 * Follows a list.
	 * @param list The list to follow
	 * @returns An object containing the `following` field
	 * @example
	 * const data = await client.lists.follow('1487049903255666689');
	 * console.log(data); // { following: true }
	 */
	async follow(list: ListResolvable): Promise<POSTUsersIdFollowedListsResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'follow');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdFollowedListsJSONBody = {
			list_id: listId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdFollowedListsResponse = await this.client._api
			.users(loggedInUser.id)
			.followed_lists.post(requestData);
		return res.data;
	}

	/**
	 * Unfollows a list.
	 * @param list The list to unfollow
	 * @returns An object containing the `following` field
	 * @example
	 * const data = await client.lists.unfollow('1487049903255666689');
	 * console.log(data); // { following: false }
	 */
	async unfollow(list: ListResolvable): Promise<DELETEUsersIdFollowedListsListIdResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'unfollow');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersIdFollowedListsListIdResponse = await this.client._api
			.users(loggedInUser.id)
			.followed_lists(listId)
			.delete(requestData);
		return res.data;
	}

	/**
	 * Pins a list.
	 * @param list The list to pin
	 * @returns An object containing the `pinned` field
	 * @example
	 * const data = await client.lists.pin('1487049903255666689');
	 * console.log(data); // { pinned: true }
	 */
	async pin(list: ListResolvable): Promise<POSTUsersIdPinnedListsResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'pin');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdPinnedListsJSONBody = {
			list_id: listId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdPinnedListsResponse = await this.client._api
			.users(loggedInUser.id)
			.pinned_lists.post(requestData);
		return res.data;
	}

	/**
	 * Unpins a list.
	 * @param list The list to unpin
	 * @returns An object containing the `pinned` field
	 * @example
	 * const data = await client.lists.unpin('1487049903255666689');
	 * console.log(data); // { pinned: false }
	 */
	async unpin(list: ListResolvable): Promise<DELETEUsersIdPinnedListsListIdResponse['data']> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'pin');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersIdPinnedListsListIdResponse = await this.client._api
			.users(loggedInUser.id)
			.pinned_lists(listId)
			.delete(requestData);
		return res.data;
	}

	/**
	 * Fetches a single list.
	 * @param listId The id of the list to fetch
	 * @param options The options for fetching the list
	 * @returns A {@link List}
	 */
	async #fetchSingleList(listId: Snowflake, options: FetchListOptions) {
		if (!options.skipCacheCheck) {
			const cachedList = this.cache.get(listId);
			if (cachedList) return cachedList;
		}
		const queryParameters = this.client.options.queryParameters;
		const query: GETListsIdQuery = {
			expansions: queryParameters?.listExpansions,
			'list.fields': queryParameters?.listFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETListsIdResponse = await this.client._api.lists(listId).get(requestData);
		return this._add(res.data.id, res, options.cacheAfterFetching);
	}
}
