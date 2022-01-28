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
		return { ...res.data };
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
	 * @returns A boolean representing whether the specified list has been deleted
	 * @example
	 * const isDeleted = await client.lists.delete('1487090844578377729');
	 * console.log(isDeleted); // true
	 */
	async delete(list: ListResolvable): Promise<boolean> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'delete');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEListsIdResponse = await this.client._api.lists(listId).delete(requestData);
		return res.data.deleted;
	}

	/**
	 * Updates a lists.
	 * @param list The list to update
	 * @param options The options for updating the list
	 * @returns A boolean representing whether the specified list has been updated
	 * @example
	 * const isUpdated = await client.lists.update('1487049903255666689', { description: 'A nice place for everyone' });
	 * console.log(isUpdated); // true
	 */
	async update(list: ListResolvable, options: UpdateListOptions): Promise<boolean> {
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
		return res.data.updated;
	}

	/**
	 * Adds a member to a list.
	 * @param list The list to add the member to
	 * @param user The user to add as a member of the list
	 * @returns A boolean representing whether the specified user has been added to the List
	 */
	async addMember(list: ListResolvable, user: UserResolvable): Promise<boolean> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'add member to');
		const userId = this.client.users.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'add to the list');
		const body: POSTListsIdMembersJSONBody = {
			user_id: userId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTListsIdMembersResponse = await this.client._api.lists(listId).members.post(requestData);
		return res.data.is_member;
	}

	/**
	 * Removes a member from a list.
	 * @param list The list to remove the member from
	 * @param member The member to remove from the list
	 * @returns A boolean representing whether the specified member has been removed from the list
	 */
	async removeMember(list: ListResolvable, member: UserResolvable): Promise<boolean> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'remove the member from');
		const userId = this.client.users.resolveId(member);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'remove from the list');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEListsIdMembersUserIdResponse = await this.client._api
			.lists(listId)
			.members(userId)
			.delete(requestData);
		return !res.data.is_member;
	}

	/**
	 * Follows a list.
	 * @param list The list to follow
	 * @returns A boolean representing whether the authorized user followed the list
	 */
	async follow(list: ListResolvable): Promise<boolean> {
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
		return res.data.following;
	}

	/**
	 * Unfollows a list.
	 * @param list The list to unfollow
	 * @returns A boolean representing whether the authorized user unfollowed the list
	 */
	async unfollow(list: ListResolvable): Promise<boolean> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'unfollow');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersIdFollowedListsListIdResponse = await this.client._api
			.users(loggedInUser.id)
			.followed_lists(listId)
			.delete(requestData);
		return !res.data.following;
	}

	/**
	 * Pins a list.
	 * @param list The list to pin
	 * @returns A boolean representing whether the authorized user pinned the list
	 */
	async pin(list: ListResolvable): Promise<boolean> {
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
		return res.data.pinned;
	}

	/**
	 * Unpins a list.
	 * @param list The list to unpin
	 * @returns A boolean representing whether the authorized user unpinned the list
	 */
	async unpin(list: ListResolvable): Promise<boolean> {
		const listId = this.resolveId(list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'pin');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersIdPinnedListsListIdResponse = await this.client._api
			.users(loggedInUser.id)
			.pinned_lists(listId)
			.delete(requestData);
		return res.data.pinned;
	}

	/**
	 * Fetches a single list.
	 * @param listId The id of the list to fetch
	 * @param options The options for fetching the list
	 * @returns A {@link List} as a `Promise`
	 * @internal
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
		const data: GETListsIdResponse = await this.client._api.lists(listId).get(requestData);
		return this._add(data.data.id, data, options.cacheAfterFetching);
	}
}
