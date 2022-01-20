import { setTimeout } from 'node:timers/promises';
import { AsyncQueue } from '@sapphire/async-queue';
import { TwitterAPIError } from './TwitterAPIError';
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
    const res = await request.make();

    if (res.ok) {
      if (request.isStreaming) return res;
      const parsedResponse = (await parseResponse(res)) as Record<string, unknown> | ArrayBuffer;
      if ('errors' in parsedResponse) {
        if (this.manager.client.options.events.includes('PARTIAL_ERROR')) {
          /**
           * Emitted when the raw data of a 200 OK API response contains error along with the requested data.
           * Use this to debug what fields are missing and why
           */
          this.manager.client.emit(ClientEvents.PARTIAL_ERROR, parsedResponse.errors);
        }
        // Throw error if there is no data field in the response as there is nothing to process. (⚠ not sure this is true for every response, will look this up later)
        // Currently the thrown error will contain information about the first error only, listen for `partialError` to get the complete error object
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if ('data' in parsedResponse === false) throw new TwitterAPIError(parsedResponse.errors[0]); // TODO
      }
      return parsedResponse;
    } else {
      if (request.isStreaming) {
        // It seems that there is some kind of latency issue with the filtered tweets stream endpoint,
        // where the server thinks that the client is connecting with a simultaneous second connection
        // whereas the client is actually connecting to the stream “again” after disconnecting.
        // Hence, Wait for an arbitrary 20s period before initiating a new connection to the stream.
        await setTimeout(20000); // TODO: Remove this once the latency issue has been fixed
        return this.execute(request);
      }
      const apiError = (await parseResponse(res)) as APIProblem;
      throw new TwitterAPIError(apiError);
    }
  }
}
