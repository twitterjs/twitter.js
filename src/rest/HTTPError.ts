/**
 * Represents an HTTP error from a request
 */
export class HTTPError extends Error {
  /**
   * The HTTP method used for the request
   */
  method: string;

  /**
   * The reason for the error
   */
  reason: string | null;

  /**
   * The relative path of the request
   */
  path: string;

  constructor(method: string, message: string, name: string, path: string) {
    super(message);
    this.name = name;

    this.method = method;
    this.reason = message.split('reason: ')[1] ?? null;
    this.path = path;
  }
}
