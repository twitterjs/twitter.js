import { BaseStream } from './BaseStream';
import type { Client } from '../client';

export class SampledTweetStream extends BaseStream {
  /**
   * @param client The logged in {@link Client} instance
   */
  constructor(client: Client) {
    super(client);
  }
}
