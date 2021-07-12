import User from './User.js';
import { RequestData } from './misc/Misc.js';
import BaseStructure from './BaseStructure.js';
import Collection from '../util/Collection.js';
import { CustomError } from '../errors/index.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { GetUserFollowersQuery, GetUserFollowersResponse, Snowflake } from 'twitter-types';

/**
 * A class that acts as a book for followers of a twitter user and holds methods for fetching them
 */
export default class FollowersBook<C extends ClientUnionType> extends BaseStructure<C> {
  /**
   * The ID of the user this followers book belongs to
   */
  userID: Snowflake;

  /**
   * The maximum amount of followers that will be fetched per page. This will be `null` if not provided and api will default to `100`
   *
   * **Note:** This is the max count and will **not** always be equal to the number of followers fetched in a page
   */
  maxResultsPerPage: number | null;

  /**
   * Whether there are more pages of followers to be fetched
   *
   * **Note:** User this as a check for deciding whether to fetch more pages
   */
  hasMore: boolean | null;

  /**
   * The collection of followers that was last fetched
   */
  currentPage: Collection<Snowflake, User<C>> | null;

  #nextToken?: string;

  #previousToken?: string;

  constructor(client: ClientInUse<C>, userID: Snowflake, maxResultsPerPage?: number) {
    super(client);
    this.userID = userID;
    this.maxResultsPerPage = maxResultsPerPage ?? null;
    this.hasMore = null;
    this.currentPage = null;
  }

  /**
   * Fetches the next page of the followers book if there is one.
   * @returns A {@link Collection} of users that are following the user this followers book belongs to
   */
  async fetchNextPage(): Promise<Collection<Snowflake, User<C>>> {
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED', 'followers book');
    return this.#fetchPages(this.#nextToken);
  }

  /**
   * Fetches the previous page of the followers book if there is one.
   * @returns A {@link Collection} of users that are following the user this followers book belongs to
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, User<C>>> {
    if (!this.#previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED', 'followers book');
    return this.#fetchPages(this.#previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  /**
   * Fetches the first page of the followers book.
   *
   * ⚠ **Note:** This method is only for internal use of the library
   * @private
   */
  async _init(): Promise<void> {
    await this.#fetchPages();
  }

  async #fetchPages(token?: string): Promise<Collection<Snowflake, User<C>>> {
    const fetchedFollowersCollection = new Collection<Snowflake, User<C>>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetUserFollowersQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData(query, null);
    const data: GetUserFollowersResponse = await this.client._api.users(this.userID).followers.get(requestData);
    this.#nextToken = data.meta.next_token;
    this.#previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = new User(this.client, { data: rawUser, includes: rawUsersIncludes });
      fetchedFollowersCollection.set(user.id, user);
    }
    this.currentPage = fetchedFollowersCollection;
    return fetchedFollowersCollection;
  }
}
