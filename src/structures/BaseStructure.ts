import type Client from '../client/Client.js';

/**
 * Base class for all structures
 */
export default class BaseStructure {
  /**
   * The client that instantiated this class
   */
  client: Client;

  constructor(client: Client) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;
  }
}
