import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type User } from '../structures';
import type { Client } from '../client';
import type { ListMembersBookOptions } from '../typings';
import type { GETListsIdMembersQuery, GETUsersIdFollowersResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching users who are members of a list
 */
export class ListMembersBook extends BaseBook {
  /**
   * The Id of the list this book belongs to
   */
  listId: Snowflake;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the book with
   */
  constructor(client: Client, options: ListMembersBookOptions) {
    super(client, options);
    const listId = client.lists.resolveId(options.list);
    if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'create ListMembersBook for');
    this.listId = listId;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link User} objects who are members of the given list
   */
  async fetchNextPage(): Promise<Collection<Snowflake, User>> {
    if (!this._hasMadeInitialRequest) {
      this._hasMadeInitialRequest = true;
      return this.#fetchPages();
    }
    if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this._nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of {@link User} objects who are members of the given list
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, User>> {
    if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this._previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, User>> {
    const listMembers = new Collection<Snowflake, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETListsIdMembersQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData({ query });
    const data: GETUsersIdFollowersResponse = await this.client._api.users(this.listId).followers.get(requestData);
    this._nextToken = data.meta.next_token;
    this._previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    if (data.meta.result_count === 0) return listMembers;
    const rawUsers = data.data;
    const rawIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.client.users._add(rawUser.id, { data: rawUser, includes: rawIncludes });
      listMembers.set(user.id, user);
    }
    return listMembers;
  }
}
