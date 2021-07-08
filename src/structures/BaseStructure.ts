import type { ClientInUse, ClientUnionType } from '../typings/Types.js';

/**
 * The base class for all structures
 */
export default class BaseStructure<C extends ClientUnionType> {
  /**
   * The client that initialized this class
   */
  client: ClientInUse<C>;

  /**
   * @param client The client this structure belongs to
   */
  constructor(client: ClientInUse<C>) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;
  }
}
