import crypto from 'node:crypto';
import OAuth from 'oauth-1.0a';
import { Collection } from '../util';
import { CustomError } from '../errors';
import { buildRoute } from './APIRouter';
import { APIRequest } from './APIRequest';
import { RequestHandler } from './RequestHandler';
import type { Client } from '../client';
import type { Response } from 'undici';
import type { ExtendedRequestData } from '../typings';

/**
 * Manager class for the rest API
 */
export class RESTManager {
	/**
	 * The instance of {@link Client} that was used to log in
	 */
	client: Client;

	/**
	 * The collection of request handlers
	 */
	requestHandlers: Collection<string, RequestHandler>;

	/**
	 * @param client The logged in {@link Client} instance
	 */
	constructor(client: Client) {
		Object.defineProperty(this, 'client', { writable: true, enumerable: false });
		this.client = client;
		this.requestHandlers = new Collection();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get routeBuilder(): any {
		return buildRoute(this);
	}

	get baseURL(): string {
		return this.client.options.api?.baseURL as string;
	}

	getBearerAuth(): string {
		const client = this.client;
		if (!client.token) throw new CustomError('NO_BEARER_TOKEN');
		return `Bearer ${client.token}`;
	}

	getUserContextAuth(method: string, url: string): string {
		const client = this.client;
		const clientCredentials = client.credentials;
		if (!clientCredentials) throw new CustomError('NO_CLIENT_CREDENTIALS');

		const oauth = new OAuth({
			consumer: {
				key: clientCredentials.consumerKey,
				secret: clientCredentials.consumerSecret,
			},
			signature_method: 'HMAC-SHA1',
			hash_function(base_string, key) {
				return crypto.createHmac('sha1', key).update(base_string).digest('base64');
			},
		});

		return oauth.toHeader(
			oauth.authorize(
				{
					url: url.toString(),
					method: method,
				},
				{
					key: clientCredentials.accessToken,
					secret: clientCredentials.accessTokenSecret,
				},
			),
		).Authorization;
	}

	async request(
		method: string,
		path: string,
		options: ExtendedRequestData<unknown, unknown>,
	): Promise<Record<string, unknown> | ArrayBuffer | Response> {
		const apiRequest = new APIRequest(this, method, path, options);
		let handler = this.requestHandlers.get(apiRequest.route);
		if (!handler) {
			handler = new RequestHandler(this);
			this.requestHandlers.set(apiRequest.route, handler);
		}
		return handler.push(apiRequest);
	}
}
