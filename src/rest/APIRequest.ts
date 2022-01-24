import { fetch } from 'undici';
import type { Client } from '../client';
import type { RESTManager } from './RESTManager';
import type { RequestData } from '../structures';
import type { Response, HeadersInit, BodyInit } from 'undici';
import type { ExtendedRequestData } from '../typings';

export class APIRequest {
	rest: RESTManager;
	method: string;
	path: string;
	options: RequestData<unknown, unknown>;
	route: string;
	client: Client;
	isStreaming?: boolean;

	constructor(rest: RESTManager, method: string, path: string, options: ExtendedRequestData<unknown, unknown>) {
		this.rest = rest;
		this.method = method;
		this.path = path;
		this.options = options;
		this.route = options.route;
		Object.defineProperty(this, 'client', { writable: true, enumerable: false });
		this.client = rest.client;
		this.isStreaming = options.isStreaming;

		if (options.query && typeof options.query === 'object') {
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

		const headers: HeadersInit = {};
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
			keepalive: true,
			headers,
			body,
		});
	}
}
