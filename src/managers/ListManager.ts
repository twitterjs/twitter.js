import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { List, RequestData } from '../structures';
import type { Client } from '../client';
import type { CreateListOptions, ListResolvable } from '../typings';
import type {
  DeleteListDeleteResponse,
  PostListCreateJSONBody,
  PostListCreateResponse,
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
}
