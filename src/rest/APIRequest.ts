import fetch from 'node-fetch';
import type Client from '../client/Client.js';
import type RESTManager from './RESTManager.js';
import type { RequestData } from '../structures/Misc.js';
import type { ExtendedRequestData } from '../typings/index.js';

export default class APIRequest {
  rest: RESTManager;
  method: string;
  path: string;
  options: RequestData<unknown, unknown>;
  route: string;
  client: Client;

  constructor(rest: RESTManager, method: string, path: string, options: ExtendedRequestData<string, unknown>) {
    this.rest = rest;
    this.method = method;
    this.path = path;
    this.options = options;
    this.route = options.route;
    this.client = rest.client;

    if (options.query) {
      const queryString = Object.entries(options.query)
        .filter(([, value]) => value !== null && typeof value !== 'undefined')
        .map(([key, value]) => (Array.isArray(value) ? `${key}=${value.join(',')}` : `${key}=${value}`))
        .join('&');

      this.path = `${path}?${queryString}`;
    }
  }

  async make(): Promise<any> {
    const baseURL = `${this.client.options.api.baseURL}/${this.client.options.api.version}`;
    const url = baseURL + this.path;

    const headers: any = {};
    headers.Authorization = this.options.requireUserContextAuth
      ? this.rest.getUserContextAuth(this.method, url)
      : this.rest.getBasicAuth();

    let body;
    if (this.method !== 'get' && this.options.body) {
      body = JSON.stringify(this.options.body);
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      method: this.method,
      headers,
      body,
    });
  }
}
