declare module 'twitter.js' {
	import { EventEmitter } from 'events';
	import BaseCollection from '@discordjs/collection';

	// Class Types
	export class BaseClient extends EventEmitter {
		constructor();
	}

	export class BaseManager {
		constructor(client: Client);
		public readonly client: Client;
		public cache: Collection;
	}

	export class BaseStructure {
		constructor(client: Client);
		public readonly client: Client;
	}
	
	export class Client extends BaseClient {
		constructor();
		private rest: RESTManager;
		private _triggerClientReady(): void;
	
		public token: string | null;
		public readyAt: Date | null;
		public users: UserManager;
		public login(token?: string): string;
	}

	export class Collection extends BaseCollection {
	}

	export class RESTManager {
		constructor(client: Client);
		public client: Client;
		public fetchTweetById(id: Snowflake): Promise<Object>;
		public fetchUserById(id: Snowflake): Promise<Object>;
		public fetchUserByUsername(username: string): Promise<Object>;
		public fetchUsersByIds(ids: Array<Snowflake>): Promise<Object>;
		public fetchUsersByUsernames(usernames: Array<string>): Promise<Object>;
	}

	export class User extends BaseStructure {
		constructor(client: Client);
	}

	export class UserManager extends BaseManager {
		constructor(client: Client);
	}

	type Snowflake = string;

	type UserResolvable = User | Snowflake | string;

	interface FetchUserOption {
		user: UserResolvable;
		cache?: boolean;
		skipCacheCheck?: boolean;
	}

	interface FetchUsersOption {
		user?: UserResolvable | UserResolvable[];
		skipCacheCheck?: boolean;
	}
}