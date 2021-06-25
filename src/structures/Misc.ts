/**
 * The class for storing data required for generating an API request
 */
export class RequestData<Q, B> {
  /**
   * The query for the request
   */
  query: Q;

  /**
   * The body of the request
   */
  body: B;

  /**
   * Whether the requested endpoint require user context authorization
   */
  requireUserContextAuth: boolean;

  constructor(query: Q, body: B, requireUserContextAuth: boolean) {
    this.query = query;
    this.body = body;
    this.requireUserContextAuth = requireUserContextAuth;
  }
}
