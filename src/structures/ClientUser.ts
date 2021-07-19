import User from './User.js';
import type { ClientInUse } from '../typings/Types.js';
import type { SingleUserLookupResponse } from 'twitter-types';
import type BlocksBook from '../structures/books/BlocksBook.js';
import type UserContextClient from '../client/UserContextClient.js';

export default class ClientUser<C extends UserContextClient> extends User<C> {
  constructor(client: ClientInUse<C>, data: SingleUserLookupResponse) {
    super(client, data);
  }

  /**
   * Creates a {@link BlocksBook} object for fetching users blocked by the authorized user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page
   * @returns A {@link BlocksBook} object
   */
  createBlocksBook(maxResultsPerPage?: number): BlocksBook<UserContextClient> {
    return this.client.createBlocksBook(maxResultsPerPage);
  }
}
