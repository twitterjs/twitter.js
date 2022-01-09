import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { type List, RequestData } from '../structures';
import type { Client } from '../client';
import type { FollowedListsBookOptions } from '../typings';
import type { GETUsersIdFollowedListsQuery, GETUsersIdFollowedListsResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching lists followed by a user
 */
export class FollowedListsBook extends BaseBook {
  /**
   * The Id of the user this book belongs to
   */
  userId: Snowflake;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the book with
   */
  constructor(client: Client, options: FollowedListsBookOptions) {
    super(client, options);
    const userId = client.users.resolveId(options.user);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'create FollowedListsBook for');
    this.userId = userId;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link List} that the given user follows
   */
  async fetchNextPage(): Promise<Collection<Snowflake, List>> {
    if (!this._hasMadeInitialRequest) {
      this._hasMadeInitialRequest = true;
      return this.#fetchPages();
    }
    if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this._nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of {@link List} that the given user follows
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, List>> {
    if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this._previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, List>> {
    const followedLists = new Collection<Snowflake, List>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETUsersIdFollowedListsQuery = {
      expansions: queryParameters?.listExpansions,
      'user.fields': queryParameters?.userFields,
      'list.fields': queryParameters?.listFields,
      pagination_token: token,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData({ query });
    const data: GETUsersIdFollowedListsResponse = await this.client._api
      .users(this.userId)
      .followed_lists.get(requestData);
    this._nextToken = data.meta.next_token;
    this._previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    if (data.meta.result_count === 0) return followedLists;
    const rawLists = data.data;
    const rawIncludes = data.includes;
    for (const rawList of rawLists) {
      const list = this.client.lists._add(rawList.id, { data: rawList, includes: rawIncludes }, false);
      followedLists.set(list.id, list);
    }
    return followedLists;
  }
}
