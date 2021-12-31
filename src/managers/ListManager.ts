import { BaseManager } from './BaseManager';
import { List, RequestData } from '../structures';
import { CustomError, CustomTypeError } from '../errors';
import type { Client } from '../client';
import type { CreateListOptions, ListResolvable, UpdateListOptions, UserResolvable } from '../typings';
import type {
  DELETE_2_lists_id_members_user_id_Response,
  DELETE_2_lists_id_Response,
  DELETE_2_users_id_followed_lists_list_id_Response,
  DELETE_2_users_id_pinned_lists_list_id_Response,
  POST_2_lists_id_members_JSONBody,
  POST_2_lists_id_members_Response,
  POST_2_lists_JSONBody,
  POST_2_lists_Response,
  POST_2_users_id_followed_lists_JSONBody,
  POST_2_users_id_followed_lists_Response,
  POST_2_users_id_pinned_lists_JSONBody,
  POST_2_users_id_pinned_lists_Response,
  PUT_2_lists_id_JSONBody,
  PUT_2_lists_id_Response,
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
   * @param options The options for creating a list
   * @returns The created {@link List} object
   */
  async create(options: CreateListOptions): Promise<List> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    const body: POST_2_lists_JSONBody = {
      name: options.name,
      description: options.description,
      private: options.private,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: POST_2_lists_Response = await this.client._api.lists.post(requestData);
    const list = this._add(res.data.id, res.data);
    return list;
  }

  /**
   * Deletes a list.
   * @param list The list to delete
   * @returns A boolean representing whether the specified list has been deleted
   */
  async delete(list: ListResolvable): Promise<boolean> {
    const listId = this.resolveId(list);
    if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'delete');
    const requestData = new RequestData({ isUserContext: true });
    const res: DELETE_2_lists_id_Response = await this.client._api.lists(listId).delete(requestData);
    return res.data.deleted;
  }

  /**
   * Updates a lists.
   * @param list The list to update
   * @param options The options for updating the list
   * @returns A boolean representing whether the specified list has been updated
   */
  async update(list: ListResolvable, options: UpdateListOptions): Promise<boolean> {
    const listId = this.resolveId(list);
    if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'update');
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    const body: PUT_2_lists_id_JSONBody = {
      name: options.name,
      description: options.description,
      private: options.private,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: PUT_2_lists_id_Response = await this.client._api.lists(listId).put(requestData);
    return res.data.updated;
  }

  /**
   * Adds a member to a list
   * @param list The list to add the member to
   * @param member The user to add as a member of the list
   * @returns A boolean representing whether the specified user has been added to the List
   */
  async addMember(list: ListResolvable, member: UserResolvable): Promise<boolean> {
    const listId = this.resolveId(list);
    if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'add member to');
    const userId = this.client.users.resolveId(member);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'add to the list');
    const body: POST_2_lists_id_members_JSONBody = {
      user_id: userId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: POST_2_lists_id_members_Response = await this.client._api.lists(listId).members.post(requestData);
    return res.data.is_member;
  }

  /**
   * Removes a member from a list.
   * @param list The list to remove the member from
   * @param member The member to remove from the list
   * @returns A boolean representing whether the specified user has been removed from the list
   */
  async removeMember(list: ListResolvable, member: UserResolvable): Promise<boolean> {
    const listId = this.resolveId(list);
    if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'remove the member from');
    const userId = this.client.users.resolveId(member);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'remove from the list');
    const requestData = new RequestData({ isUserContext: true });
    const res: DELETE_2_lists_id_members_user_id_Response = await this.client._api
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
    const body: POST_2_users_id_followed_lists_JSONBody = {
      list_id: listId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: POST_2_users_id_followed_lists_Response = await this.client._api
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
    const res: DELETE_2_users_id_followed_lists_list_id_Response = await this.client._api
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
    const body: POST_2_users_id_pinned_lists_JSONBody = {
      list_id: listId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: POST_2_users_id_pinned_lists_Response = await this.client._api
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
    const res: DELETE_2_users_id_pinned_lists_list_id_Response = await this.client._api
      .users(loggedInUser.id)
      .pinned_lists(listId)
      .delete(requestData);
    return res.data.pinned;
  }
}
