import { AsyncQueue } from '@sapphire/async-queue';
import { parseResponse } from '../util/Utility.js';
import type { Response } from 'node-fetch';
import type APIRequest from './APIRequest.js';
import type RESTManager from './RESTManager.js';

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

  async push(request: APIRequest): Promise<any> {
    await this.queue.wait();
    try {
      return await this.execute(request);
    } finally {
      this.queue.shift();
    }
  }

  async execute(request: APIRequest): Promise<any> {
    let res: Response;
    try {
      res = await request.make();
    } catch (error) {
      throw new Error('TODO'); // TODO
    }

    if (res && res.headers) {
      if (res.ok) {
        return parseResponse(res);
      }
    }
  }
}
