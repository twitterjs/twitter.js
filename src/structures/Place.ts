import { PlaceGeo } from './misc/Misc.js';
import BaseStructure from './BaseStructure.js';
import type Client from '../client/Client.js';
import type { APIPlaceGeo, APIPlaceObject, APIPlaceType } from 'twitter-types';

export default class Place extends BaseStructure {
  fullName: string;

  override id: string;

  containedWithin: Array<string>;

  country: string | null;

  countryCode: string | null;

  geo: APIPlaceGeo | null;

  name: string | null;

  placeType: APIPlaceType | null;

  constructor(client: Client, data: APIPlaceObject) {
    super(client, data.id);

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
