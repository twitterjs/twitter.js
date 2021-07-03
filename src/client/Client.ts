import BaseClient from './BaseClient.js';
import RESTManager from '../rest/RESTManager.js';
import { ClientEvents } from '../util/Constants.js';
import UserManager from '../managers/UserManager.js';
import { CustomTypeError } from '../errors/index.js';
import TweetManager from '../managers/TweetManager.js';
import type { ClientCredentials, ClientEventsMapping, ClientOptions } from '../typings/Interfaces.js';
import type { ClientEventArgsType, ClientEventKeyType, ClientEventListenerType } from '../typings/Types.js';

/**
 * The core of the library
 */
export default class Client extends BaseClient {
  /**
   * The credentials for the client to login with
   */
  credentials: ClientCredentials | null;

  /**
   * Time at which the client became `ready`
   */
  readyAt: Date | null;

  /**
   * The rest manager class that holds the methods for API calls
   */
  rest: RESTManager;

  /**
   * The tweet manager of this client
   */
  tweets: TweetManager;

  /**
   * The user manager of this client
   */
  users: UserManager;

  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'credentials', { writable: true });
    this.credentials = null;

    this.readyAt = null;
    this.rest = new RESTManager(this);
    this.tweets = new TweetManager(this);
    this.users = new UserManager(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get _api(): any {
    return this.rest.routeBuilder;
  }

  /**
   * Logs in the client and stores the provided credentials in memory
   * @param credentials The credentials for making requests
   * @returns The credentials that were provided
   *
   * @throws {@link CustomTypeError} The exception is thrown if the credentials param is not an Object
   */
  async login(credentials: ClientCredentials): Promise<ClientCredentials> {
    if (typeof credentials !== 'object') {
      throw new CustomTypeError('INVALID_TYPE', 'credentials', 'Object', true);
    }
    this.credentials = credentials;
    this.readyAt = new Date();

    this.emit(ClientEvents.READY);
    return this.credentials;
  }

  public on<K extends keyof ClientEventsMapping | symbol>(
    event: ClientEventKeyType<K>,
    listener: (...args: ClientEventListenerType<K>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  public once<K extends keyof ClientEventsMapping | symbol>(
    event: ClientEventKeyType<K>,
    listener: (...args: ClientEventListenerType<K>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  public emit<K extends keyof ClientEventsMapping | symbol>(
    event: ClientEventKeyType<K>,
    ...args: ClientEventArgsType<K>
  ): boolean {
    return super.emit(event, args);
  }
}
