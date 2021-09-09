import { PlaceGeo } from './misc';
import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIPlace, APIPlaceGeo, APIPlaceType } from 'twitter-types';

/**
 * The class that represents a place tagged in a {@link Tweet}
 */
export class Place extends BaseStructure {
  fullName: string;

  id: string;

  containedWithin: Array<string>;

  country: string | null;

  countryCode: string | null;

  geo: APIPlaceGeo | null;

  name: string | null;

  placeType: APIPlaceType | null;

  constructor(client: Client, data: APIPlace) {
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
