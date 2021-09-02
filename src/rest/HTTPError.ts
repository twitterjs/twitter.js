/**
 * Represents an HTTP error from a request
 */
export class HTTPError extends Error {
  /**
   * The HTTP method used for the request
   */
  method: string;

  /**
   * The type of error
   */
  type: string;

  /**
   * The code of the error
   */
  code: string | null;

  /**
   * The reason for the error
   */
  reason: string | null;

  /**
   * The relative path of the request
   */
  path: string;

  constructor(method: string, message: string, name: string, path: string, type: string, code?: string) {
    super(message);
    this.name = name;

    this.method = method;
    this.type = type;
    this.code = code ?? null;
    this.reason = message.split('reason: ')[1] ?? null;
    this.path = path;
  }
}
