import https from 'https';
import fetch from 'node-fetch';
import type { Client } from '../client/Client.js';
import type { RESTManager } from './RESTManager.js';
import type { RequestData } from '../structures/misc/Misc.js';
import type { Response, HeaderInit, BodyInit } from 'node-fetch';
import type { ExtendedRequestData } from '../typings/Interfaces.js';

const agent = new https.Agent({ keepAlive: true });

export class APIRequest {
  rest: RESTManager;
  method: string;
  path: string;
  options: RequestData<unknown, unknown>;
  route: string;
  client: Client;
  isStreaming?: boolean;

  constructor(rest: RESTManager, method: string, path: string, options: ExtendedRequestData<string, unknown>) {
    this.rest = rest;
    this.method = method;
    this.path = path;
    this.options = options;
    this.route = options.route;
    this.client = rest.client;
    this.isStreaming = options.isStreaming;

    if (options.query) {
      const queryString = Object.entries(options.query)
        .filter(([, value]) => value !== null && typeof value !== 'undefined')
        .map(([key, value]) => (Array.isArray(value) ? `${key}=${value.join(',')}` : `${key}=${value}`))
        .join('&');

      this.path = `${path}?${queryString}`;
    }
  }

  async make(): Promise<Response> {
    const baseURL = `${this.client.options.api?.baseURL}/${this.client.options.api?.version}`;
    const url = baseURL + this.path;

    const headers: HeaderInit = {};
    headers.Authorization = this.options.isUserContext
      ? this.rest.getUserContextAuth(this.method, url)
      : this.rest.getBearerAuth();

    let body: BodyInit | undefined;
    if (this.method !== 'get' && this.options.body) {
      body = JSON.stringify(this.options.body);
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      method: this.method,
      headers,
      agent,
      body,
    });
  }
}
