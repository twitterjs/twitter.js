'use strict';

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

/**
 * Generates a request header for HTTP calls
 * @param {string} HTTPverb The request method for this call
 * @param {string} bearerToken The Bearer Token for authorization
 * @returns {object} A request header for HTTP calls
 */
export function getHeaderObject(HTTPverb, bearerToken) {
  const headerObject = {
    method: HTTPverb,
    headers: {
      authorization: `Bearer ${bearerToken}`,
    },
  };
  return headerObject;
}

/**
 * Generates a request header for HTTP calls that requires user context (OAuth 1.0)
 * @param {string} HTTPverb The request method for this call
 * @param {object} token The bot credentials object
 * @param {string} endpoint The endpoint url to hide-unhide a reply including the tweet ID
 * @param {boolean} hideOrUnhide True if the reply is to be hidden else false
 */
export function getUserContextHeaderObject(HTTPverb, token, endpoint, hideOrUnhide) {
  const oauth = new OAuth({
    consumer: {
      key: token.consumerKey,
      secret: token.consumerSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });

  const userContextAuth = oauth.authorize(
    {
      url: endpoint.toString(),
      method: HTTPverb,
    },
    {
      key: token.accessToken,
      secret: token.accessTokenSecret,
    },
  );

  const headerObject = {
    method: HTTPverb,
    headers: {
      'Content-Type': 'application/json',
      Authorization: oauth.toHeader(userContextAuth).Authorization,
    },
    body: JSON.stringify({ hidden: hideOrUnhide }),
  };

  return headerObject;
}
