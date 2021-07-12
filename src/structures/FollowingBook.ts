import User from './User.js';
import BaseBook from './BaseBook.js';
import { RequestData } from './misc/Misc.js';
import Collection from '../util/Collection.js';
import { CustomError } from '../errors/index.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { GetUserFollowingQuery, GetUserFollowingResponse, Snowflake } from 'twitter-types';

/**
 * A class used for keeping track of users followed by a twitter user
 */
export default class FollowingBook<C extends ClientUnionType> extends BaseBook<C> {
  #nextToken?: string;

  #previousToken?: string;

  constructor(client: ClientInUse<C>, userID: Snowflake, maxResultsPerPage?: number) {
    super(client, userID, maxResultsPerPage);
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of users that the specified user is following
   */
  async fetchNextPage(): Promise<Collection<Snowflake, User<C>>> {
    if (!this.#nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this.#nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of users that the specified user is following
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, User<C>>> {
    if (!this.#previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this.#previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  /**
   * Fetches the first page of the book and makes it ready for use.
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
    const query: GetUserFollowingQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData(query, null);
    const data: GetUserFollowingResponse = await this.client._api.users(this.userID).following.get(requestData);
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
