import CommonClient from './CommonClient.js';
import RESTManager from '../rest/RESTManager.js';
import { ClientEvents } from '../util/Constants.js';
import ClientUser from '../structures/ClientUser.js';
import UserManager from '../managers/UserManager.js';
import TweetManager from '../managers/TweetManager.js';
import BlocksBook from '../structures/books/BlocksBook.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import { ClientCredentials, RequestData } from '../structures/misc/Misc.js';
import type { ClientCredentialsInterface, ClientOptions } from '../typings/Interfaces.js';
import type { GetSingleUserByUsernameQuery, GetSingleUserByUsernameResponse } from 'twitter-types';

/**
 * The core class that exposes library APIs for making user-context authorized requests
 */
export default class UserContextClient extends CommonClient<UserContextClient> {
  /**
   * The credentials that were provided to the client
   */
  credentials: ClientCredentials | null;

  /**
   * The twitter user this client represents and authorized with
   */
  me: ClientUser<UserContextClient> | null;

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

    this.me = null;
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
  async login(credentials: ClientCredentialsInterface): Promise<ClientCredentials> {
    if (typeof credentials !== 'object') {
      throw new CustomTypeError('INVALID_TYPE', 'credentials', 'object', true);
    }
    this.credentials = new ClientCredentials(credentials);
    this.readyAt = new Date();

    this.me = await this.#fetchClientUser(credentials.username);

    if (this.me?.username !== this.credentials.username)
      throw new CustomError('USER_CONTEXT_LOGIN_ERROR', this.credentials.username);

    this.emit(ClientEvents.READY, this);
    return this.credentials;
  }

  /**
   * Fetches a {@link BlocksBook} object belonging to the authorized user.
   * @param maxResultsPerPage The maximum amount of blocked users to fetch per page
   * @returns A {@link BlocksBook} object as a `Promise`
   */
  async fetchBlocksBook(maxResultsPerPage?: number): Promise<BlocksBook<UserContextClient>> {
    const userID = this.me?.id;
    if (!userID) throw new CustomError('USER_RESOLVE_ID', 'fetch blocks book of');
    const blocksBook = new BlocksBook(this, userID, maxResultsPerPage);
    await blocksBook._init();
    return blocksBook;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchClientUser(username: string): Promise<ClientUser<UserContextClient>> {
    const queryParameters = this.options.queryParameters;
    const query: GetSingleUserByUsernameQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetSingleUserByUsernameResponse = await this._api.users.by.username(username).get(requestData);
    return new ClientUser(this, data);
  }
}
