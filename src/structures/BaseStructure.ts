import type Client from '../client/Client';

/**
 * The base class for all structures
 */
export default class BaseStructure {
  /**
   * The client that initialized this class
   */
  client: Client;

  /**
   * @param client The client this structure belongs to
   */
  constructor(client: Client) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;
  }
}
