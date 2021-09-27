import { PlaceGeo } from './misc';
import type { Client } from '../client';
import type { APIPlace, APIPlaceGeo, APIPlaceType } from 'twitter-types';

/**
 * The class that represents a place tagged in a {@link Tweet}
 */
export class Place {
  /**
   * The instance of {@link Client} that was used to log in
   */
  client: Client;

  /**
   * The unique identifier of the place
   */
  id: string;

  fullName: string;

  containedWithin: Array<string>;

  country: string | null;

  countryCode: string | null;

  geo: APIPlaceGeo | null;

  name: string | null;

  placeType: APIPlaceType | null;

  constructor(client: Client, data: APIPlace) {
    Object.defineProperty(this, 'client', { writable: true, enumerable: false });
    this.client = client;
    this.id = data.id;
    this.fullName = data.full_name;
    this.containedWithin = data.contained_within ?? [];
    this.country = data.country ?? null;
    this.countryCode = data.country_code ?? null;
    this.geo = data.geo ? new PlaceGeo(data.geo) : null;
    this.name = data.name ?? null;
    this.placeType = data.place_type ?? null;
  }
}
