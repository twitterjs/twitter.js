import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData } from '../structures';
import type { Client } from '../client';
import type { User } from '../structures';
import type { CreateBlocksBookOptions } from '../typings';
import type { GetUsersBlockingQuery, GetUsersBlockingResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching users blocked by the authorized user
 */
export class BlocksBook extends BaseBook {
  /**
   * The token for fetching next page
   */
  #nextToken?: string;

  /**
   * The token for fetching previous page
   */
  #previousToken?: string;

  /**
   * Whether an initial request for fetching the first page has already been made
   *
   * **Note**: Use this to not throw `PAGINATED_RESPONSE_TAIL_REACHED` error for initial page request in {@link BlocksBook.fetchNextPage}
   */
  #hasMadeInitialRequest?: boolean;

  /**
   * The ID of the user this book belongs to
   */
  userId: Snowflake;

  /**
   * The maximum amount of users that will be fetched per page
   *
   * **Note:** This is the max count and will **not** always be equal to the number of users fetched in a page
   */
  maxResultsPerPage: number | null;

  /**
   * Whether there are more pages of users to be fetched
   *
   * **Note:** Use this as a check for deciding whether to fetch more pages
   */
  hasMore: boolean;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the blocks book with
   */
  constructor(client: Client, options: CreateBlocksBookOptions) {
    super(client);
    this.userId = options.userId;
    this.maxResultsPerPage = options.maxResultsPerPage ?? null;
    this.hasMore = true;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link User} objects that have been blocked by the authorized user
   */
  async fetchNextPage(): Promise<Collection<Snowflake, User>> {
    if (!this.#hasMadeInitialRequest) {
      this.#hasMadeInitialRequest = true;
      return this.#fetchPages();
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of {@link User} objects that have been blocked by the authorized user
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, User>> {
    if (!this.#previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this.#previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, User>> {
    const blockedUsersCollection = new Collection<Snowflake, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetUsersBlockingQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
      max_results: this.maxResultsPerPage ?? undefined,
    };
    const requestData = new RequestData({ query, isUserContext: true });
    const data: GetUsersBlockingResponse = await this.client._api.users(this.userId).blocking.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    if (data.meta.result_count === 0) return blockedUsersCollection;
    const rawUsers = data.data;
    const rawIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.client.users.add(rawUser.id, { data: rawUser, includes: rawIncludes }, false);
      blockedUsersCollection.set(user.id, user);
    }
    return blockedUsersCollection;
  }
}
