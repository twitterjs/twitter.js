import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { List, RequestData } from '../structures';
import type { Client } from '../client';
import type { CreateListOptions, ListResolvable, UpdateListOptions, UserResolvable } from '../typings';
import type {
  DeleteListDeleteResponse,
  DeleteListRemoveMemberResponse,
  PostListAddMemberJSONBody,
  PostListAddMemberResponse,
  PostListCreateJSONBody,
  PostListCreateResponse,
  PostListFollowJSONBody,
  PostListFollowResponse,
  PostListUnfollowResponse,
  PutListUpdateJSONBody,
  PutListUpdateResponse,
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
    const body: PostListCreateJSONBody = {
      name: options.name,
      description: options.description,
      private: options.private,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: PostListCreateResponse = await this.client._api.lists.post(requestData);
    const list = this.add(res.data.id, res.data);
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
    const res: DeleteListDeleteResponse = await this.client._api.lists(listId).delete(requestData);
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
    const body: PutListUpdateJSONBody = {
      name: options.name,
      description: options.description,
      private: options.private,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: PutListUpdateResponse = await this.client._api.lists(listId).put(requestData);
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
    const body: PostListAddMemberJSONBody = {
      user_id: userId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: PostListAddMemberResponse = await this.client._api.lists(listId).members.post(requestData);
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
    const res: DeleteListRemoveMemberResponse = await this.client._api
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
    const body: PostListFollowJSONBody = {
      list_id: listId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const res: PostListFollowResponse = await this.client._api.users(loggedInUser.id).followed_lists.post(requestData);
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
    const res: PostListUnfollowResponse = await this.client._api
      .users(loggedInUser.id)
      .followed_lists(listId)
      .delete(requestData);
    return !res.data.following;
  }
}
