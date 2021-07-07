import CommonClient from './CommonClient.js';
import RESTManager from '../rest/RESTManager.js';
import { ClientEvents } from '../util/Constants.js';
import UserManager from '../managers/UserManager.js';
import { CustomTypeError } from '../errors/index.js';
import TweetManager from '../managers/TweetManager.js';
import type { ClientCredentials, ClientOptions } from '../typings/Interfaces.js';

/**
 * The core of the library
 */
export default class UserContextClient extends CommonClient {
  /**
   * The credentials for the client to login with
   */
  credentials: ClientCredentials | null;

  /**
   * The rest manager class that holds the methods for API calls
   */
  rest: RESTManager<UserContextClient>;

  /**
   * The tweet manager of this client
   */
  tweets: TweetManager<UserContextClient>;

  /**
   * The user manager of this client
   */
  users: UserManager<UserContextClient>;

  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'credentials', { writable: true });
    this.credentials = null;

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
      throw new CustomTypeError('INVALID_TYPE', 'credentials', 'object', true);
    }
    this.credentials = credentials;
    this.readyAt = new Date();

    this.emit(ClientEvents.READY);
    return this.credentials;
  }
}
