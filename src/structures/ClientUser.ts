import { User } from './User';
import type { Client } from '../client';
import type { SingleUserLookupResponse } from 'twitter-types';

export class ClientUser extends User {
	constructor(client: Client, data: SingleUserLookupResponse) {
		super(client, data);
	}
}
