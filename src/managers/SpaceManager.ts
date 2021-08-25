import Space from '../structures/Space.js';
import BaseManager from './BaseManager.js';
import Collection from '../util/Collection.js';
import { CustomTypeError } from '../errors/index.js';
import { RequestData } from '../structures/misc/Misc.js';
import type {
  ClientInUse,
  ClientUnionType,
  FetchSpaceOptions,
  FetchSpacesOptions,
  SpaceManagerFetchResult,
  SpaceResolvable,
} from '../typings';
import type {
  GetMultipleSpacesByIdsQuery,
  GetMultipleSpacesByIdsResponse,
  GetSingleSpaceByIdQuery,
  GetSingleSpaceByIdResponse,
  Snowflake,
} from 'twitter-types';

export default class SpaceManager<C extends ClientUnionType> extends BaseManager<
  Snowflake,
  SpaceResolvable<C>,
  Space<C>,
  C
> {
  constructor(client: ClientInUse<C>) {
    super(client, Space);
  }

  /**
   * Fetches spaces from twitter.
   * @param options The options for fetching spaces
   * @returns A {@link Space} or a {@link Collection} of them as a `Promise`
   */
  async fetch<T extends FetchSpaceOptions<C> | FetchSpacesOptions<C>>(
    options: T,
  ): Promise<SpaceManagerFetchResult<C, T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('space' in options) {
      const spaceId = this.resolveID(options.space);
      if (!spaceId) throw new CustomTypeError('TODO');
      return this.#fetchSingleSpace(spaceId, options) as Promise<SpaceManagerFetchResult<C, T>>;
    }
    if ('spaces' in options) {
      if (!Array.isArray(options.spaces)) throw new CustomTypeError('INVALID_TYPE', 'spaces', 'array', true);
      const spaceIds = options.spaces.map(space => {
        const spaceId = this.resolveID(space);
        if (!spaceId) throw new CustomTypeError('TODO');
        return spaceId;
      });
      return this.#fetchMultipleSpaces(spaceIds, options) as Promise<SpaceManagerFetchResult<C, T>>;
    }
    throw new CustomTypeError('INVALID_FETCH_OPTIONS');
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleSpace(spaceId: Snowflake, options: FetchSpaceOptions<C>): Promise<Space<C>> {
    if (!options.skipCacheCheck) {
      const cachedSpace = this.cache.get(spaceId);
      if (cachedSpace) return cachedSpace;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GetSingleSpaceByIdQuery = {
      expansions: queryParameters?.spaceExpansions,
      'space.fields': queryParameters?.spaceFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetSingleSpaceByIdResponse = await this.client._api.spaces(spaceId).get(requestData);
    return this.add(data.data.id, data, options.cacheAfterFetching);
  }

  async #fetchMultipleSpaces(
    spaceIds: Array<Snowflake>,
    options: FetchSpacesOptions<C>,
  ): Promise<Collection<Snowflake, Space<C>>> {
    const fetchedSpaceCollection = new Collection<Snowflake, Space<C>>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleSpacesByIdsQuery = {
      ids: spaceIds,
      expansions: queryParameters?.spaceExpansions,
      'space.fields': queryParameters?.spaceFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetMultipleSpacesByIdsResponse = await this.client._api.spaces.get(requestData);
    const rawSpaces = data.data;
    const rawSpacesIncludes = data.includes;
    for (const rawSpace of rawSpaces) {
      const space = this.add(rawSpace.id, { data: rawSpace, includes: rawSpacesIncludes }, options.cacheAfterFetching);
      fetchedSpaceCollection.set(space.id, space);
    }
    return fetchedSpaceCollection;
  }
}
