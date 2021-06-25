import BaseClient from './BaseClient.js';
import RESTManager from '../rest/RESTManager.js';
import TweetManager from '../managers/TweetManager.js';
import type { ClientCredentials, ClientOptions } from '../typings/index.js';

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

  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'credentials', { writable: true });
    this.credentials = null;

    this.readyAt = null;
    this.rest = new RESTManager(this);
    this.tweets = new TweetManager(this);
  }

  get _api(): any {
    return this.rest.routeBuilder;
  }

  async login(credentials: ClientCredentials): Promise<ClientCredentials> {
    if (!credentials) {
      throw new Error('No client credentials provided');
    }
    this.credentials = credentials;
    this.readyAt = new Date();
    this.emit('ready');
    return this.credentials;
  }
}
