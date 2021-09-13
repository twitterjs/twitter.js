import { User } from './User';
import { BlocksBook } from '../books';
import type { Client } from '../client';
import type { Collection } from '../util';
import type { FetchBlocksOptions } from '../typings';
import type { SingleUserLookupResponse, Snowflake } from 'twitter-types';

export class ClientUser extends User {
  constructor(client: Client, data: SingleUserLookupResponse) {
    super(client, data);
  }

  /**
   * Fetches users blocked by the authorized user.
   * @param options The options for fetching blocked users
   * @returns A tuple containing {@link BlocksBook} object and a {@link Collection} of {@link User} objects representing the first page
   */
  async fetchBlocks(options?: FetchBlocksOptions): Promise<[BlocksBook, Collection<Snowflake, User>]> {
    const blocksBook = new BlocksBook(this.client, { userId: this.id, maxResultsPerPage: options?.maxResultsPerPage });
    const firstPage = await blocksBook.fetchNextPage();
    return [blocksBook, firstPage];
  }
}
