import { PlaceGeo } from './misc/Misc.js';
import BaseStructure from './BaseStructure.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { APIPlace, APIPlaceGeo, APIPlaceType } from 'twitter-types';

/**
 * The class that represents a place tagged in a {@link Tweet}
 */
export default class Place<C extends ClientUnionType> extends BaseStructure<C> {
  fullName: string;

  id: string;

  containedWithin: Array<string>;

  country: string | null;

  countryCode: string | null;

  geo: APIPlaceGeo | null;

  name: string | null;

  placeType: APIPlaceType | null;

  constructor(client: ClientInUse<C>, data: APIPlace) {
    super(client);

    this.fullName = data.full_name;
    this.id = data.id;
    this.containedWithin = data.contained_within ?? [];
    this.country = data.country ?? null;
    this.countryCode = data.country_code ?? null;
    this.geo = data.geo ? new PlaceGeo(data.geo) : null;
    this.name = data.name ?? null;
    this.placeType = data.place_type ?? null;
  }
}
