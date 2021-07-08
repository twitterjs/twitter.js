import CommonClient from './CommonClient.js';
import RESTManager from '../rest/RESTManager.js';
import { ClientEvents } from '../util/Constants.js';
import UserManager from '../managers/UserManager.js';
import { CustomTypeError } from '../errors/index.js';
import TweetManager from '../managers/TweetManager.js';
import type { ClientOptions } from '../typings/Interfaces.js';

/**
 * The core class that exposes library APIs for making bearer token authorized requests
 */
export default class BearerClient extends CommonClient {
  /**
   * The bearer token that was provided for the client
   */
  token: string | null;

  /**
   * The class that manages and forwards API requests made by the client
   */
  rest: RESTManager<BearerClient>;

  /**
   * The tweet manager class of the client
   */
  tweets: TweetManager<BearerClient>;

  /**
   * The user manager class of the client
   */
  users: UserManager<BearerClient>;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'token', { writable: true });
    this.token = null;

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
   * Makes the client ready for use and stores the provided token in memory.
   * Emits a `ready` event on success.
   * @param token The bearer token for the client
   * @returns The provided bearer token as a `Promise`
   *
   * @throws {@link CustomTypeError} The exception is thrown if the `token` param is not a string
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
