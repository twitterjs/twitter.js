'use strict';

import Collection from '../util/Collection.js';
import SnowflakeUtil from '../util/SnowflakeUtil.js';

/**
 * Base class for all managers
 * @abstract
 */
class BaseManager {
  /**
   *
   * @param {Client} client The client that instantiated this class
   * @param {BaseStructure} structureType The Data Model this Manager holds
   */
  constructor(client, structureType) {
    /**
     * The client that instantiated this Manager
     * @name BaseManager#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * Cache of the structures held by this Manager
     * @type {Collection}
     */
    this.cache = new Collection();

    /**
     * The type of structure or data model this Manager holds
     * @name BaseManager#structureType
     * @type {Function}
     * @private
     * @readonly
     */
    Object.defineProperty(this, 'structureType', { value: structureType });
  }

  /**
   * Resolves a data entry to its respective Structure
   * @param {string|Object} structureResolvable The id or instance of the structure held by this Manager
   * @returns {?Object} An instance of the Structure held by this Manager
   */
  resolve(structureResolvable) {
    if (structureResolvable instanceof this.structureType) return structureResolvable;
    if (typeof structureResolvable === 'string') return this.cache.get(structureResolvable) || null;
    return null;
  }

  /**
   * Resolves a data entry to its respective Structure ID
   * @param {string|Object} structureResolvable The id or instance of the structure held by this Manager
   * @returns {?Snowflake} An ID of the Structure held by this Manager
   */
  resolveID(structureResolvable) {
    if (structureResolvable instanceof this.structureType) return structureResolvable.id;
    if (SnowflakeUtil.isID(structureResolvable)) return structureResolvable;
    return null;
  }
}

export default BaseManager;
