import { SimplifiedSpace } from './SimplifiedSpace';
import type { Client } from '../client';
import type { SingleSpaceLookupResponse } from 'twitter-types';

export class Space extends SimplifiedSpace {
  constructor(client: Client, data: SingleSpaceLookupResponse) {
    super(client, data.data);
  }
}
