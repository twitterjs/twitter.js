import type { Response } from 'node-fetch';
import type { ClientOptions } from '../typings/index.js';

const has = (obj: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

/* eslint-disable */
export function mergeDefault(defaultObject: any, given: any): ClientOptions {
  if (!given) return defaultObject;
  let key: keyof ClientOptions | any;
  for (key in defaultObject) {
    if (!has(given, key) || given[key] === undefined) {
      given[key] = defaultObject[key];
    } else if (given[key] === Object(given[key])) {
      given[key] = mergeDefault(defaultObject[key], given[key]);
    }
  }
  return given as ClientOptions;
}
/* eslint-enable */

/**
 * Parses an API response and returns the body
 * @param res The response sent by the API
 * @returns The body of the response
 */
export async function parseResponse(res: Response): Promise<unknown | Buffer> {
  if (res.headers.get('content-type')?.startsWith('application/json')) return res.json();
  return res.buffer();
}
