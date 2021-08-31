import { User } from './User.js';
import type { Client } from '../client/Client.js';
import type { SingleUserLookupResponse } from 'twitter-types';
import type { BlocksBook } from '../structures/books/BlocksBook.js';

export class ClientUser extends User {
  constructor(client: Client, data: SingleUserLookupResponse) {
    super(client, data);
  }

  /**
   * Creates a {@link BlocksBook} object for fetching users blocked by the authorized user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page
   * @returns A {@link BlocksBook} object
   */
  createBlocksBook(maxResultsPerPage?: number): BlocksBook {
    return this.client.createBlocksBook(maxResultsPerPage);
  }
}
