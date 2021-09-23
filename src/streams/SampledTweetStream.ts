import { BaseStream } from './BaseStream';
import type { Client } from '../client';

export class SampledTweetStream extends BaseStream {
  constructor(client: Client) {
    super(client);
  }
}
