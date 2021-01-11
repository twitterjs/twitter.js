import { EventEmitter } from 'events';
import BaseCollection from '@discordjs/collection';

// Class Types
export class BaseClient extends EventEmitter {
  constructor();
}

export class BaseManager<K, structureType, R> {
  constructor(client: Client, structureType: structureType);
  public readonly client: Client;
  public cache: Collection<K, structureType>;
  public structureType: structureType;
  public resolve(structureResolvable: R): structureType | null;
  public resolveID(structureResolvable: R): K | null;
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

export class Collection<K, V> extends BaseCollection<K, V> {
}

export class RESTManager {
  constructor(client: Client);
  public client: Client;
  public fetchTweetById(id: Snowflake): Promise<object>;
  public fetchTweetsById(id: Array<Snowflake>): Promise<object>;
  public fetchUserById(id: Snowflake): Promise<object>;
  public fetchUserByUsername(username: string): Promise<object>;
  public fetchUsersByIds(ids: Array<Snowflake>): Promise<object>;
  public fetchUsersByUsernames(usernames: Array<string>): Promise<object>;
}

export class User extends BaseStructure {
  constructor(client: Client);
  public readonly createdAt: Date;
  public description: string;
  public entities: object | null;
  public id: Snowflake;
  public location: string;
  public name: string;
  public pinnedTweet: object | null;
  public pinnedTweetID: Snowflake | null;
  public profileImageURL: string;
  public protected: boolean;
  public publicMetrics: object | null;
  public url: string | null;
  public username: string;
  public verified: boolean;
  public withheld: object | null;
}

export class UserManager extends BaseManager<Snowflake, User, UserResolvable> {
  constructor(client: Client);
  public fetch(options: UserResolvable | FetchUserOption | (FetchUsersOption & { user: UserResolvable })): Promise<User>;
  public fetch(options?: FetchUsersOption): Promise<Collection<Snowflake, User>>;
}

type Snowflake = string;

type UserResolvable = User | Snowflake | string;

interface FetchUserOption {
  user: UserResolvable;
  cache?: boolean;
  skipCacheCheck?: boolean;
}

interface FetchUsersOption {
  user?: UserResolvable | Array<UserResolvable>;
  skipCacheCheck?: boolean;
}