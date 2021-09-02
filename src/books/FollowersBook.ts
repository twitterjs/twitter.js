import { BaseBook } from './BaseBook.js';
import { CustomError } from '../errors/index.js';
import { Collection } from '../util/Collection.js';
import { RequestData } from '../structures/misc/Misc.js';
import type { User } from '../structures/User.js';
import type { Client } from '../client/Client.js';
import type { GetUsersFollowersQuery, GetUsersFollowersResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching followers of a twitter user
 */
export class FollowersBook extends BaseBook {
  #nextToken?: string;

  #previousToken?: string;

  #hasBeenInitialized?: boolean;

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

  constructor(client: Client, userId: Snowflake, maxResultsPerPage?: number) {
    super(client);
    this.userId = userId;
    this.maxResultsPerPage = maxResultsPerPage ?? null;
    this.hasMore = true;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link User} objects who have been following the owner of this book
   */
  async fetchNextPage(): Promise<Collection<Snowflake, User>> {
    if (!this.#hasBeenInitialized) {
      this.#hasBeenInitialized = true;
      return this.#fetchPages(this.#nextToken);
    }
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of {@link User} objects who have been following the owner of this book
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, User>> {
    if (!this.#previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this.#previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, User>> {
    const followersCollection = new Collection<Snowflake, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetUsersFollowersQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
      max_results: this.maxResultsPerPage ?? undefined,
    };
    const requestData = new RequestData({ query });
    const data: GetUsersFollowersResponse = await this.client._api.users(this.userId).followers.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    const rawUsers = data.data;
    const rawIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.client.users.add(rawUser.id, { data: rawUser, includes: rawIncludes });
      followersCollection.set(user.id, user);
    }
    return followersCollection;
  }
}
