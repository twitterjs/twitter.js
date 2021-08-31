import User from '../User.js';
import { RequestData } from '../misc/Misc.js';
import BaseStructure from '../BaseStructure.js';
import Collection from '../../util/Collection.js';
import { CustomError } from '../../errors/index.js';
import type Client from '../../client/Client.js';
import type { GetUsersBlockingQuery, GetUsersBlockingResponse, Snowflake } from 'twitter-types';

/**
 * A class used for keeping track of users blocked by the authorized user
 */
export default class BlocksBook extends BaseStructure {
  #nextToken?: string;

  #previousToken?: string;

  #hasBeenInitialized?: boolean;

  /**
   * The ID of the user this book belongs to
   */
  userID: Snowflake;

  /**
   * The maximum amount of users that will be fetched per page.
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

  constructor(client: Client, userID: Snowflake, maxResultsPerPage?: number) {
    super(client);
    this.userID = userID;
    this.maxResultsPerPage = maxResultsPerPage ?? null;
    this.hasMore = true;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of users that are blocked by the authorized user
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
   * @returns A {@link Collection} of users that are blocked by the authorized user
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
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData({ query });
    const data: GetUsersBlockingResponse = await this.client._api.users(this.userID).blocking.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    const rawUsers = data.data;
    if (!rawUsers) return blockedUsersCollection;
    const rawIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = new User(this.client, { data: rawUser, includes: rawIncludes });
      blockedUsersCollection.set(user.id, user);
    }
    return blockedUsersCollection;
  }
}
