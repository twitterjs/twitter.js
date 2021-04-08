import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { buildRoute } from './APIRouter.js';
import APIRequest from './APIRequest.js';

/**
 * Manager class for the rest API
 * @private
 */
class RESTManager {
  /**
   * @param {Client} client The client that instantiated this class
   */
  constructor(client) {
    /**
     * @type {Client}
     */
    this.client = client;
  }

  get api() {
    return buildRoute(this);
  }

  get endpoint() {
    return this.client.options.http.api;
  }

  request(method, url, options) {
    const apiRequest = new APIRequest(this, method, url, options);
    return apiRequest.make();
  }

  getAuth() {
    return `Bearer ${this.client.token.bearerToken}`;
  }

  getUserContextAuth(method, url) {
    const oauth = new OAuth({
      consumer: {
        key: this.client.token.consumerKey,
        secret: this.client.token.consumerSecret,
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
          key: this.client.token.accessToken,
          secret: this.client.token.accessTokenSecret,
        },
      ),
    ).Authorization;
  }
}

export default RESTManager;
