import { SimplifiedSpace } from './SimplifiedSpace.js';
import type { Client } from '../client/Client.js';
import type { SingleSpaceLookupResponse } from 'twitter-types';

export class Space extends SimplifiedSpace {
  constructor(client: Client, data: SingleSpaceLookupResponse) {
    super(client, data.data);
  }
}
