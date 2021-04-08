/**
 * Base class for all structures
 * @abstract
 */
class BaseStructure {
  /**
   * @param {Client} client The client that instantiated this class
   */
  constructor(client) {
    /**
     * The client that instantiated this Structure
     * @name BaseStructure#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });
  }
}

export default BaseStructure;
