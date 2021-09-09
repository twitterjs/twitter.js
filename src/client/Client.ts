import { BaseClient } from './BaseClient';
import { RESTManager } from '../rest/RESTManager';
import { ClientEvents, Collection } from '../util';
import { CustomError, CustomTypeError } from '../errors';
import { SampledTweetStream, FilteredTweetStream } from '../streams';
import { UserManager, TweetManager, SpaceManager } from '../managers';
import { ClientCredentials, RequestData, ClientUser } from '../structures';
import { BlocksBook, CountTweetsBook, SearchTweetsBook } from '../books';
import type { User, Tweet } from '../structures';
import type {
  GetSingleUserByUsernameQuery,
  GetSingleUserByUsernameResponse,
  GetTweetCountsResponse,
  Snowflake,
} from 'twitter-types';
import type {
  ClientCredentialsInterface,
  ClientEventsMapping,
  ClientOptions,
  CountTweetsBookCreateOptions,
  SearchTweetsBookCreateOptions,
  ClientEventKeyType,
  ClientEventArgsType,
  ClientEventListenerType,
} from '../typings';

/**
 * The core class that exposes all the functionalities available in twitter.js
 */
export class Client extends BaseClient {
  /**
   * The time at which the client became `ready`
   */
  readyAt: Date | null;

  /**
   * The bearer token that was provided to the client during login
   */
  token: string | null;

  /**
   * The credentials that were provided to the client during login
   *
   * **Note**: This will be available only if the client was logged in using {@link Client.login}
   */
  credentials: ClientCredentials | null;

  /**
   * The twitter user this client represents
   *
   * **Note**: This will be available only if the client was logged in using {@link Client.login}
   */
  me: ClientUser | null;

  /**
   * The manager for twitter API requests made by the client
   */
  rest: RESTManager;

  /**
   * The manager for {@link Tweet} objects
   */
  tweets: TweetManager;

  /**
   * The manager for {@link User} objects
   */
  users: UserManager;

  /**
   * The manager for {@link Space} objects
   */
  spaces: SpaceManager;

  /**
   * The class for working with sampled tweet stream
   */
  sampledTweets: SampledTweetStream;

  /**
   * The class for working with filtered tweet stream
   */
  filteredTweets: FilteredTweetStream;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'token', { writable: true });
    this.token = null;

    Object.defineProperty(this, 'credentials', { writable: true });
    this.credentials = null;

    this.me = null;
    this.readyAt = null;
    this.rest = new RESTManager(this);
    this.tweets = new TweetManager(this);
    this.users = new UserManager(this);
    this.spaces = new SpaceManager(this);
    this.sampledTweets = new SampledTweetStream(this);
    this.filteredTweets = new FilteredTweetStream(this);
  }

  /**
   * A getter that returns the `routeBuilder` method of {@link RESTManager}
   * for making API requests
   *
   * **Note**: This is a shortcut made available for internal use only, users of the library need not to
   * use it and should treat it as a private field
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get _api(): any {
    return this.rest.routeBuilder;
  }

  /**
   * Sets the client ready to make bearer token authorized API requests.
   * Emits a `ready` event on success.
   * @param token The bearer token for the client
   * @returns The provided bearer token as a `Promise`
   *
   * @throws {@link CustomTypeError} The exception is thrown if the `token` param is not a string
   */
  async loginWithBearerToken(token: string): Promise<string> {
    if (typeof token !== 'string') {
      throw new CustomTypeError('INVALID_TYPE', 'token', 'string', false);
    }
    this.token = token;
    this.readyAt = new Date();

    this.emit(ClientEvents.READY, this);
    return this.token;
  }

  /**
   * Sets the client ready to make both bearer token and user context authorized API requests.
   * Emits a `ready` event on success.
   * @param credentials The credentials for the client
   * @returns The provided credentials as a `Promise`
   *
   * @throws {@link CustomTypeError} The exception is thrown if the `credentials` param is not an object
   */
  async login(credentials: ClientCredentialsInterface): Promise<ClientCredentials> {
    if (typeof credentials !== 'object') {
      throw new CustomTypeError('INVALID_TYPE', 'credentials', 'object', true);
    }
    this.credentials = new ClientCredentials(credentials);
    this.token = this.credentials.bearerToken;
    this.readyAt = new Date();

    this.me = await this.#fetchClientUser(credentials.username);

    if (this.me?.username !== this.credentials.username)
      throw new CustomError('USER_CONTEXT_LOGIN_ERROR', this.credentials.username);

    this.emit(ClientEvents.READY, this);
    return this.credentials;
  }

  /**
   * Creates a {@link SearchTweetsBook} object for fetching tweets using search query.
   * @param options The options for creating the book
   * @returns A tuple containing {@link SearchTweetsBook} object and a {@link Collection} of {@link Tweet} objects representing the first page
   */
  async fetchSearchTweetsBook(
    options: SearchTweetsBookCreateOptions,
  ): Promise<[SearchTweetsBook, Collection<Snowflake, Tweet>]> {
    const searchTweetsBook = new SearchTweetsBook(this, options);
    const firstPage = await searchTweetsBook.fetchNextPage();
    return [searchTweetsBook, firstPage];
  }

  /**
   * Creates a {@link CountTweetsBook} object for fetching number of tweets matching a query.
   * @param options The options for creating the book
   * @returns TODO
   */
  async fetchCountTweetsBook(
    options: CountTweetsBookCreateOptions,
  ): Promise<[CountTweetsBook, GetTweetCountsResponse]> {
    const countTweetsBook = new CountTweetsBook(this, options);
    const firstPage = await countTweetsBook.fetchNextPage();
    return [countTweetsBook, firstPage];
  }

  /**
   * Creates a {@link BlocksBook} object for fetching users blocked by the authorized user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page
   * @returns A tuple containing {@link BlocksBook} object and a {@link Collection} of {@link User} objects representing the first page
   */
  async fetchBlocksBook(maxResultsPerPage?: number): Promise<[BlocksBook, Collection<Snowflake, User>]> {
    const userID = this.me?.id;
    if (!userID) throw new CustomError('USER_RESOLVE_ID', 'create blocks book for');
    const blocksBook = new BlocksBook(this, userID, maxResultsPerPage);
    const firstPage = await blocksBook.fetchNextPage();
    return [blocksBook, firstPage];
  }

  override on<K extends keyof ClientEventsMapping | symbol>(
    event: ClientEventKeyType<K>,
    listener: (...args: ClientEventListenerType<K>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  override once<K extends keyof ClientEventsMapping | symbol>(
    event: ClientEventKeyType<K>,
    listener: (...args: ClientEventListenerType<K>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  override emit<K extends keyof ClientEventsMapping | symbol>(
    event: ClientEventKeyType<K>,
    ...args: ClientEventArgsType<K>
  ): boolean {
    return super.emit(event, ...args);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchClientUser(username: string): Promise<ClientUser> {
    const queryParameters = this.options.queryParameters;
    const query: GetSingleUserByUsernameQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetSingleUserByUsernameResponse = await this._api.users.by.username(username).get(requestData);
    return new ClientUser(this, data);
  }
}
