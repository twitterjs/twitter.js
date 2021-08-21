import Space from '../structures/Space.js';
import BaseManager from './BaseManager.js';
import { RequestData } from '../structures/misc/Misc.js';
import type { GetSingleSpaceByIdQuery, GetSingleSpaceByIdResponse, Snowflake } from 'twitter-types';
import type { ClientInUse, ClientUnionType, SpaceResolvable } from '../typings';

export default class SpaceManager<C extends ClientUnionType> extends BaseManager<
  Snowflake,
  SpaceResolvable<C>,
  Space<C>,
  C
> {
  constructor(client: ClientInUse<C>) {
    super(client, Space);
  }

  async fetchSingleSpace(spaceId: Snowflake): Promise<any> {
    const queryParameters = this.client.options.queryParameters;
    const query: GetSingleSpaceByIdQuery = {
      expansions: queryParameters?.spaceExpansions,
      'space.fields': queryParameters?.spaceFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetSingleSpaceByIdResponse = await this.client._api.spaces(spaceId).get(requestData);
    return this.add(data.data.id, data);
  }
}
