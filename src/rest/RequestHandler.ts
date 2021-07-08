import HTTPError from './HTTPError.js';
import { FetchError } from 'node-fetch';
import TwitterAPIError from './TwitterAPIError.js';
import { AsyncQueue } from '@sapphire/async-queue';
import { parseResponse } from '../util/Utility.js';
import { ClientEvents } from '../util/Constants.js';
import type { Response } from 'node-fetch';
import type APIRequest from './APIRequest.js';
import type RESTManager from './RESTManager.js';
import type { APIProblem } from 'twitter-types';
import type { ClientUnionType } from '../typings/Types.js';

export default class RequestHandler<C extends ClientUnionType> {
  /**
   * The manager of that initiated this class
   */
  manager: RESTManager<C>;

  /**
   * The queue for the requests
   */
  queue: AsyncQueue;

  constructor(manager: RESTManager<C>) {
    this.manager = manager;
    this.queue = new AsyncQueue();
  }

  async push(request: APIRequest<C>): Promise<Record<string, unknown> | Buffer | APIProblem | undefined> {
    await this.queue.wait();
    try {
      return await this.execute(request);
    } finally {
      this.queue.shift();
    }
  }

  async execute(request: APIRequest<C>): Promise<Record<string, unknown> | Buffer | APIProblem | undefined> {
    let res: Response;
    try {
      res = await request.make();
    } catch (error: unknown) {
      if (error instanceof FetchError) {
        throw new HTTPError(request.method, error.message, error.name, request.path, error.type, error.code);
      } else {
        throw error;
      }
    }

    if (res && res.headers) {
      if (res.ok) {
        const parsedResponse = await parseResponse(res);
        if ('errors' in parsedResponse) {
          /**
           * Emitted when the raw data of a 200 OK API response contains error along with the requested data.
           * Use this to debug what fields are missing and why
           */
          this.manager.client.emit(ClientEvents.PARTIAL_ERROR, parsedResponse.errors);

          // Throw error if there is no data field in the response as there is nothing to process. (⚠ not sure this is true for every response, will look this up later)
          // Currently the thrown error will contain information about the first error only, listen for `partialError` to get the complete error object
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if ('data' in parsedResponse === false) throw new TwitterAPIError(parsedResponse.errors[0]); // TODO
        }
        return parsedResponse;
      }

      if (res.status >= 400 && res.status < 500) {
        let apiError: APIProblem;
        try {
          apiError = (await parseResponse(res)) as APIProblem;
        } catch (error: unknown) {
          if (error instanceof FetchError) {
            throw new HTTPError(request.method, error.message, error.name, request.path, error.type, error.code);
          } else {
            throw error;
          }
        }
        throw new TwitterAPIError(apiError);
      }
    }
  }
}
