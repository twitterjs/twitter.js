import BaseAPIError from './BaseAPIError.js';
import type { APIInvalidRequestProblem, APIInvalidRequestProblemErrors } from 'twitter-types';

export default class InvalidRequestError extends BaseAPIError {
  type: 'Invalid Request';

  errors: Record<string, string>;

  constructor(data: APIInvalidRequestProblem) {
    super(data);
    this.type = data.title;
    this.errors = this.#patchErrors(data.errors);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  #patchErrors(errors: Array<APIInvalidRequestProblemErrors>): Record<string, string> {
    const errorsObject: Record<string, string> = {};
    for (const [i, error] of errors.entries()) {
      errorsObject[i] = error.message;
    }
    return errorsObject;
  }
}
