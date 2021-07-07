import type { ClientInUse, ClientUnionType } from '../typings/Types.js';

/**
 * Base class for all structures
 */
export default class BaseStructure<C extends ClientUnionType> {
  /**
   * The client that instantiated this class
   */
  client: ClientInUse<C>;

  constructor(client: ClientInUse<C>) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;
  }
}
