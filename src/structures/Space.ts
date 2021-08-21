import SimplifiedSpace from './SimplifiedSpace.js';
import type { SingleSpaceLookupResponse } from 'twitter-types';
import type { ClientInUse, ClientUnionType } from '../typings';

export default class Space<C extends ClientUnionType> extends SimplifiedSpace<C> {
  constructor(client: ClientInUse<C>, data: SingleSpaceLookupResponse) {
    super(client, data.data);
  }
}
