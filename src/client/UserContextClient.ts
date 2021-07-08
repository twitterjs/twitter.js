import CommonClient from './CommonClient.js';
import RESTManager from '../rest/RESTManager.js';
import { ClientEvents } from '../util/Constants.js';
import UserManager from '../managers/UserManager.js';
import { CustomTypeError } from '../errors/index.js';
import TweetManager from '../managers/TweetManager.js';
import type { ClientCredentials, ClientOptions } from '../typings/Interfaces.js';

/**
 * The core class that exposes library APIs for making user-context authorized requests
 */
export default class UserContextClient extends CommonClient {
  /**
   * The credentials that were provided to the client
   */
  credentials: ClientCredentials | null;

  /**
   * The class that manages and forwards API requests made by the client
   */
  rest: RESTManager<UserContextClient>;

  /**
   * The tweet manager class of the client
   */
  tweets: TweetManager<UserContextClient>;

  /**
   * The user manager class of the client
   */
  users: UserManager<UserContextClient>;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'credentials', { writable: true });
    this.credentials = null;

    this.rest = new RESTManager(this);
    this.tweets = new TweetManager(this);
    this.users = new UserManager(this);
  }

  /**
   * A getter that returns the buildRoute function from {@link APIRouter}
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get _api(): any {
    return this.rest.routeBuilder;
  }

  /**
   * Makes the client ready for use and stores the provided credentials in memory.
   * Emits a `ready` event on success.
   * @param credentials The credentials for the client
   * @returns The provided credentials as a `Promise`
   *
   * @throws {@link CustomTypeError} The exception is thrown if the `credentials` param is not an object
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
