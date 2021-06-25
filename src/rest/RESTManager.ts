import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import APIRequest from './APIRequest.js';
import { buildRoute } from './APIRouter.js';
import Collection from '../util/Collection.js';
import RequestHandler from './RequestHandler.js';
import type Client from '../client/Client.js';
import type { ExtendedRequestData } from '../typings/index.js';

/**
 * Manager class for the rest API
 */
export default class RESTManager {
  /**
   * The client that instantiated this class
   */
  client: Client;

  /**
   * The collection of request handlers
   */
  requestHandlers: Collection<string, RequestHandler>;

  constructor(client: Client) {
    this.client = client;
    this.requestHandlers = new Collection();
  }

  get routeBuilder(): any {
    return buildRoute(this);
  }

  get baseURL(): string {
    return this.client.options.api.baseURL;
  }

  getBasicAuth(): string {
    return `Bearer ${this.client.credentials?.bearerToken}`;
  }

  getUserContextAuth(method: string, url: string): string {
    const clientCredentials = this.client.credentials;
    if (!clientCredentials) throw new Error('No client credentials found');

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

  async request(method: string, path: string, options: ExtendedRequestData<string, unknown>): Promise<any> {
    const apiRequest = new APIRequest(this, method, path, options);
    let handler = this.requestHandlers.get(apiRequest.route);
    if (!handler) {
      handler = new RequestHandler(this);
      this.requestHandlers.set(apiRequest.route, handler);
    }
    return handler.push(apiRequest);
  }
}
