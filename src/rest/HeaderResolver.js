'use strict';

/**
 * Generates a request header for HTTP calls
 * @param {string} HTTPverb The request method for this call
 * @param {string} token The Bearer Token for authorization
 * @returns {object} A request header for HTTP calls
 */
export function getHeaderObject(HTTPverb, token) {
  const headerObject = {
    method: HTTPverb,
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  return headerObject;
}
