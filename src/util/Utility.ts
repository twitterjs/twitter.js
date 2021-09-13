import type { Response } from 'node-fetch';
import type { APIProblem } from 'twitter-types';
import type { ClientOptions } from '../typings';

/**
 * Checks whether a given key is present in a given object.
 * @param targetObject The object to check the key in
 * @param key The key to check
 * @returns `true` if the key is present, otherwise `false`
 */
export const objectHasKey = (targetObject: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(targetObject, key);

/* eslint-disable */
export function mergeDefault(defaultObject: any, givenObject: any): ClientOptions {
  if (!givenObject) return defaultObject;
  let key: keyof ClientOptions | any;
  for (key in defaultObject) {
    if (!objectHasKey(givenObject, key) || givenObject[key] === undefined) {
      givenObject[key] = defaultObject[key];
    } else if (givenObject[key] === Object(givenObject[key])) {
      givenObject[key] = mergeDefault(defaultObject[key], givenObject[key]);
    }
  }
  return givenObject as ClientOptions;
}
/* eslint-enable */

/**
 * Parses an API response and returns the body
 * @param res The response sent by the API
 * @returns The body of the response
 */
export async function parseResponse(res: Response): Promise<Record<string, unknown> | Buffer | APIProblem> {
  if (res.headers.get('content-type')?.startsWith('application/json')) return res.json();
  return res.buffer();
}
