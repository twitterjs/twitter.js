import type { ClientInUse, ClientUnionType } from '../typings/index.js';

export default class BaseStream<C extends ClientUnionType> {
  client: ClientInUse<C>;

  constructor(client: ClientInUse<C>) {
    this.client = client;
  }
}
