import User from '../User.js';
import BaseStructure from '../BaseStructure.js';
import Collection from '../../util/Collection.js';
import type { Snowflake } from 'twitter-types';
import type { ClientInUse, ClientUnionType } from '../../typings/Types.js';

/**
 * A base class for all books
 */
export default class BaseBook<C extends ClientUnionType> extends BaseStructure<C> {
  /**
   * The ID of the user this book belongs to
   */
  userID: Snowflake;

  /**
   * The maximum amount of users that will be fetched per page. This will be `null` if not provided and api will default to `100`
   *
   * **Note:** This is the max count and will **not** always be equal to the number of users fetched in a page
   */
  maxResultsPerPage: number | null;

  /**
   * Whether there are more pages of users to be fetched
   *
   * **Note:** Use this as a check for deciding whether to fetch more pages
   */
  hasMore: boolean | null;

  /**
   * The collection of users that were last fetched
   */
  currentPage: Collection<Snowflake, User<C>> | null;

  constructor(client: ClientInUse<C>, userID: Snowflake, maxResultsPerPage?: number) {
    super(client);
    this.userID = userID;
    this.maxResultsPerPage = maxResultsPerPage ?? null;
    this.hasMore = null;
    this.currentPage = null;
  }
}
