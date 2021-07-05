import { AsyncQueue } from '@sapphire/async-queue';
import { parseResponse } from '../util/Utility.js';
import { ClientEvents } from '../util/Constants.js';
import type { Response } from 'node-fetch';
import type APIRequest from './APIRequest.js';
import type RESTManager from './RESTManager.js';
import type { APIProblem } from 'twitter-types';
import TwitterAPIError from './TwitterAPIError.js';

export default class RequestHandler {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async push(request: APIRequest): Promise<any> {
    await this.queue.wait();
    try {
      return await this.execute(request);
    } finally {
      this.queue.shift();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(request: APIRequest): Promise<any> {
    let res: Response;
    try {
      res = await request.make();
    } catch (error) {
      throw new Error('TODO'); // TODO make an HTTPError for this
    }

    if (res && res.headers) {
      if (res.ok) {
        const parsedResponse = await parseResponse(res);
        if ('errors' in parsedResponse) {
          /**
           * Emitted when the raw data of a 200 OK API response contains error along with the requested data.
           * Use this to debug what fields are missing and why
           * @event Client#partialError
           * @param {Object}
           */
          this.manager.client.emit(ClientEvents.PARTIAL_ERROR, parsedResponse.errors);

          // Throw error if there is no data field in the response as there is nothing to process. (⚠ not sure this is true for every response, will look this up later)
          // Currently the thrown error will contain information about the first error only, listen for `Client#partialError` to get the complete error object
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if ('data' in parsedResponse === false) throw new TwitterAPIError(parsedResponse.errors[0]); // TODO
        }
        return parsedResponse;
      }

      if (res.status >= 400 && res.status < 500) {
        let apiError: APIProblem; // TODO
        try {
          apiError = (await parseResponse(res)) as APIProblem;
        } catch (error) {
          console.log('HTTPError at RequestHandler L63', error);
          throw new Error(`${error}`); // TODO make an HTTPError for this
        }
        throw new TwitterAPIError(apiError);
      }
    }
  }
}
