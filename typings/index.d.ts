import { EventEmitter } from 'events';
import BaseCollection from '@discordjs/collection';

export class BaseClient extends EventEmitter {
  constructor();
  private rest: RESTManager;
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
  private _triggerClientReady(): void;

  public token: ClientCredentials | null;
  public readyAt: Date | null;
  public user: User | null;
  public users: UserManager;
  public login(credentials?: ClientCredentials): ClientCredentials;
}

interface ClientCredentials {
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string,
  bearerToken: string
  username: string
}

export class Collection<K, V> extends BaseCollection<K, V> {
}

interface FetchTweetOptions {
  tweet: TweetResolvable;
  cache?: boolean;
  skipCacheCheck?: boolean;
}

interface FetchTweetsOptions {
  tweet?: TweetResolvable | Array<TweetResolvable>;
  skipCacheCheck?: boolean;
}

interface FetchUserOptions {
  user: UserResolvable;
  cache?: boolean;
  skipCacheCheck?: boolean;
}

interface FetchUsersOptions {
  user?: UserResolvable | Array<UserResolvable>;
  skipCacheCheck?: boolean;
}

export class FollowRequest {
  constructor(response: object);
  public following: boolean | null;
  public pendingFollow: boolean | null;
}

export class ReplyState {
  constructor(response: object);
  public hidden: boolean | null;
}

export class RESTManager {
  constructor(client: Client);
}

export class Tweet extends BaseStructure {
  constructor(client: Client, data: object);
  public id: string;
  public text: string;
  public attachments: object | null;
  public author: User | null;
  public authorID: string;
  public contextAnnotations: object | null;
  public conversationID: string | null;
  public createdAt: Date;
  public entites: object | null;
  public geo: object | null;
  public replyTo: string | null;
  public language: string;
  public possiblySensitive: boolean | null;
  public publicMetrics: object | null;
  public referencedTweets: object | null;
  public canReply: string;
  public source: string;
  public withheld: object | null;
}

export class TweetManager extends BaseManager<string, Tweet, TweetResolvable> {
  constructor(client: Client);
  public fetch(options: TweetResolvable | FetchTweetOptions | (FetchTweetsOptions & { tweet: TweetResolvable })): Promise<Tweet>;
  public fetch(options?: FetchTweetsOptions): Promise<Collection<string, Tweet>>;
  public hideReply(id: string): Promise<ReplyState>;
  public unhideReply(id: string): Promise<ReplyState>;
}

type TweetResolvable = Tweet | string;

export class UnfollowRequest {
  constructor(response: object);
  public following: boolean | null;
}

export class User extends BaseStructure {
  constructor(client: Client, data: object);
  public readonly createdAt: Date;
  public description: string | null;
  public entities: object | null;
  public id: string;
  public location: string | null;
  public name: string;
  public pinnedTweet: Tweet | null;
  public pinnedTweetID: string | null;
  public profileImageURL: string;
  public protected: boolean;
  public publicMetrics: object | null;
  public url: string | null;
  public username: string;
  public verified: boolean;
  public withheld: object | null;
}

export class UserManager extends BaseManager<string, User, UserResolvable> {
  constructor(client: Client);
  public fetch(options: UserResolvable | FetchUserOptions | (FetchUsersOptions & { user: UserResolvable })): Promise<User>;
  public fetch(options?: FetchUsersOptions): Promise<Collection<string, User>>;
  public follow(id: string): Promise<FollowRequest>;
  public unfollow(id: string): Promise<UnfollowRequest>;
}

type UserResolvable = User | string;