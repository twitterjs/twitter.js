import Collection from '../util/Collection.js';
import type { StructureConstructable } from '../typings/Interfaces.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';

/**
 * The base class for all managers
 */
export default class BaseManager<K extends string, R, T extends { id: K }, C extends ClientUnionType> {
  /**
   * The client that initialized this manager
   */
  client: ClientInUse<C>;

  /**
   * The cache of the structures held by this manager
   */
  cache: Collection<K, T>;

  /**
   * The structure that this manager stores in its cache
   */
  protected _holds: StructureConstructable<T>;

  /**
   * @param client The client this manager belongs to
   * @param structureType The kind of structures this manager stores
   */
  constructor(client: ClientInUse<C>, structureType: StructureConstructable<T>) {
    Object.defineProperty(this, 'client', { writable: true });
    this.client = client;

    this.cache = new Collection<K, T>();

    Object.defineProperty(this, '_holds', { writable: true });
    this._holds = structureType;
  }

  /**
   * Resolves a structure resolvable to its respective structure.
   * @param idOrInstance The ID or instance of the structure held by this manager
   */
  resolve(idOrInstance: K | R): T | null {
    if (idOrInstance instanceof this._holds) return idOrInstance;
    if (typeof idOrInstance === 'string') return this.cache.get(idOrInstance as K) ?? null;
    return null;
  }

  /**
   * Resolves a structure resolvable to its id.
   * @param idOrInstance The ID or instance of the strucutre held by this manager
   */
  resolveID(idOrInstance: K | R): K | null {
    if (idOrInstance instanceof this._holds) return idOrInstance.id;
    if (typeof idOrInstance === 'string') return idOrInstance as K;
    return null;
  }

  /**
   * Converts the raw data sent by the API into a structure of type held by this manager
   * and adds it to the cache.
   * @param id The ID of the structure
   * @param data The raw data returned by the API for this structure
   * @param cacheAfterFetching Whether to store the structure in the manager's cache
   */
  add(id: K, data: unknown, cacheAfterFetching = true): T {
    const entry = new this._holds(this.client, data);
    if (cacheAfterFetching) this.cache.set(id, entry);
    return entry;
  }
}
