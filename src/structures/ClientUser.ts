import { User } from './User';
import type { Client } from '../client';
import type { Collection } from '../util';
import type { BlocksBook } from '../books';
import type { SingleUserLookupResponse, Snowflake } from 'twitter-types';

export class ClientUser extends User {
  constructor(client: Client, data: SingleUserLookupResponse) {
    super(client, data);
  }

  /**
   * Creates a {@link BlocksBook} object for fetching users blocked by the authorized user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page
   * @returns A tuple containing {@link BlocksBook} object and a {@link Collection} of {@link User} objects representing the first page
   */
  async fetchBlocksBook(maxResultsPerPage?: number): Promise<[BlocksBook, Collection<Snowflake, User>]> {
    return this.client.fetchBlocksBook(maxResultsPerPage);
  }
}
