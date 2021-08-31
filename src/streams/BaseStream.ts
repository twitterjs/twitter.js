import type Client from '../client/Client.js';

export default class BaseStream {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }
}
