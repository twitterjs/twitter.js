import { SimplifiedUser } from './SimplifiedUser';
import { SimplifiedList } from './SimplifiedList';
import type { Client } from '../client';
import type { APIUser, SingleListLookupResponse } from 'twitter-types';

export class List extends SimplifiedList {
  /**
   * The owner of the list
   */
  owner: SimplifiedUser | null;

  constructor(client: Client, data: SingleListLookupResponse) {
    super(client, data.data);
    this.owner = this.#patchOwner(data.includes?.users) ?? null;
  }

  #patchOwner(users?: Array<APIUser>): SimplifiedUser | undefined {
    if (!users) return;
    const rawOwner = users.find(user => user.id === this.ownerId);
    if (!rawOwner) return;
    return new SimplifiedUser(this.client, rawOwner);
  }
}
