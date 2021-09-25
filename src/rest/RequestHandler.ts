import { errors } from 'undici';
import { HTTPError } from './HTTPError';
import { TwitterAPIError } from './TwitterAPIError';
import { AsyncQueue } from '@sapphire/async-queue';
import { parseResponse, ClientEvents } from '../util';
import type { Response } from 'undici';
import type { APIRequest } from './APIRequest';
import type { APIProblem } from 'twitter-types';
import type { RESTManager } from './RESTManager';

export class RequestHandler {
  /**
   * The manager of that initiated this class
   */
  manager: RESTManager;

  /**
   * The queue for the requests
   */
  queue: AsyncQueue;

  constructor(manager: RESTManager) {
    this.manager = manager;
    this.queue = new AsyncQueue();
  }

  async push(request: APIRequest): Promise<Record<string, unknown> | ArrayBuffer | Response> {
    await this.queue.wait();
    try {
      return await this.execute(request);
    } finally {
      this.queue.shift();
    }
  }

  async execute(request: APIRequest): Promise<Record<string, unknown> | ArrayBuffer | Response> {
    let res: Response;
    try {
      res = await request.make();
    } catch (error) {
      if (error instanceof errors.UndiciError) {
        throw new HTTPError(request.method, error.message, error.name, request.path);
      } else {
        throw error;
      }
    }

    if (res && request.isStreaming) return res;

    if (res && res.headers) {
      if (res.ok) {
        const parsedResponse = (await parseResponse(res)) as Record<string, unknown> | ArrayBuffer;
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
        } catch (error) {
          if (error instanceof errors.UndiciError) {
            throw new HTTPError(request.method, error.message, error.name, request.path);
          } else {
            throw error;
          }
        }
        throw new TwitterAPIError(apiError);
      }
    }

    throw new Error('No response');
  }
}
