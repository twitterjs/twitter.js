import type { Client } from '../client/Client.js';

export class BaseStream {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }
}
