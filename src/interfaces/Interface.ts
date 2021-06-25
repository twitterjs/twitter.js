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

/**
 * The options with which the client gets initiated
 */
export interface ClientOptions {
  /**
   * The options for the API
   */
  api: APIOptions;
}
