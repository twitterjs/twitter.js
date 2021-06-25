import type Client from '../client/Client.js';

/**
 * Base class for all structures
 */
export default class BaseStructure {
  /**
   * The client that instantiated this class
   */
  client: Client;

  /**
   * The Spotify ID of the structure
   */
  id: string;

  constructor(client: Client, id: string) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;

    this.id = id;
  }
}
