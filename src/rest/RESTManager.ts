import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import APIRequest from './APIRequest.js';
import { buildRoute } from './APIRouter.js';
import Collection from '../util/Collection.js';
import { CustomError } from '../errors/index.js';
import RequestHandler from './RequestHandler.js';
import BearerClient from '../client/BearerClient.js';
import UserContextClient from '../client/UserContextClient.js';
import type { APIProblem } from 'twitter-types';
import type { ExtendedRequestData } from '../typings/Interfaces.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';

/**
 * Manager class for the rest API
 */
export default class RESTManager<C extends ClientUnionType> {
  /**
   * The client that instantiated this class
   */
  client: ClientInUse<C>;

  /**
   * The collection of request handlers
   */
  requestHandlers: Collection<string, RequestHandler<C>>;

  constructor(client: ClientInUse<C>) {
    this.client = client;
    this.requestHandlers = new Collection();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get routeBuilder(): any {
    return buildRoute(this);
  }

  get baseURL(): string {
    return this.client.options.api?.baseURL as string;
  }

  getBearerAuth(): string {
    const client = this.client;
    if (!(client instanceof BearerClient)) throw new CustomError('NOT_BEARER_CLIENT');
    if (!client.token) throw new CustomError('NO_BEARER_TOKEN');
    return `Bearer ${client.token}`;
  }

  getUserContextAuth(method: string, url: string): string {
    const client = this.client;
    if (!(client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const clientCredentials = client.credentials;
    if (!clientCredentials) throw new CustomError('NO_CLIENT_CREDENTIALS');

    const oauth = new OAuth({
      consumer: {
        key: clientCredentials.consumerKey,
        secret: clientCredentials.consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    return oauth.toHeader(
      oauth.authorize(
        {
          url: url.toString(),
          method: method,
        },
        {
          key: clientCredentials.accessToken,
          secret: clientCredentials.accessTokenSecret,
        },
      ),
    ).Authorization;
  }

  async request(
    method: string,
    path: string,
    options: ExtendedRequestData<string, unknown>,
  ): Promise<Record<string, unknown> | Buffer | APIProblem | undefined> {
    const apiRequest = new APIRequest(this, method, path, options);
    let handler = this.requestHandlers.get(apiRequest.route);
    if (!handler) {
      handler = new RequestHandler(this);
      this.requestHandlers.set(apiRequest.route, handler);
    }
    return handler.push(apiRequest);
  }
}
