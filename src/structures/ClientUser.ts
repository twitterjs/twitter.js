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
   * Fetches a {@link BlocksBook} object belonging to this user.
   * @param maxResultsPerPage The maximum amount of blocked users to fetch per page
   * @returns A {@link BlocksBook} object as a `Promise`
   */
  async fetchBlocksBook(maxResultsPerPage?: number): Promise<BlocksBook<UserContextClient>> {
    return this.client.fetchBlocksBook(maxResultsPerPage);
  }
}
