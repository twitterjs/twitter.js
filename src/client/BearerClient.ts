import CommonClient from './CommonClient.js';
import RESTManager from '../rest/RESTManager.js';
import { ClientEvents } from '../util/Constants.js';
import UserManager from '../managers/UserManager.js';
import { CustomTypeError } from '../errors/index.js';
import TweetManager from '../managers/TweetManager.js';
import type { ClientOptions } from '../typings/Interfaces.js';

/**
 * This is the core of the library that exposes methods and properties
 * to the user for making Bearer Token authorized requests
 */
export default class BearerClient extends CommonClient {
  /**
   * The bearer token for the client to login with
   */
  token: string | null;

  /**
   * The rest manager class that holds the methods for API calls
   */
  rest: RESTManager<BearerClient>;

  /**
   * The tweet manager of this client
   */
  tweets: TweetManager<BearerClient>;

  /**
   * The user manager of this client
   */
  users: UserManager<BearerClient>;

  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'token', { writable: true });
    this.token = null;

    this.rest = new RESTManager(this);
    this.tweets = new TweetManager(this);
    this.users = new UserManager(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get _api(): any {
    return this.rest.routeBuilder;
  }

  /**
   * Logs in the client and stores the provided token in memory
   * @param token The bearer token for making requests
   * @returns The token that was provided
   *
   * @throws {@link CustomTypeError} The exception is thrown if the credentials param is not an Object
   */
  async login(token: string): Promise<string> {
    if (typeof token !== 'string') {
      throw new CustomTypeError('INVALID_TYPE', 'token', 'string', false);
    }
    this.token = token;
    this.readyAt = new Date();

    this.emit(ClientEvents.READY);
    return this.token;
  }
}
