import type { RequestData } from '../structures/Misc.js';

/**
 * The options related to the API version
 */
export interface APIOptions {
  /**
   * Current default version of the API
   */
  version: number;

  /**
   * The base URL of the API
   */
  baseURL: string;
}

export interface ClientCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
  username: string;
}

/**
 * The options with which the client gets initiated
 */
export interface ClientOptions {
  /**
   * The options for the API
   */
  api: APIOptions;
}

export interface ExtendedRequestData<Q, B> extends RequestData<Q, B> {
  route: string;
}

export interface StructureConstructable<T> {
  // @ts-ignore
  new(...args: any[]): T;
}
