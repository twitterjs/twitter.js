import type { ClientOptions } from '../client';
import {
	APIListExpansionsParameters,
	APIListFieldsParameters,
	APIMediaFieldsParameters,
	APIPlaceFieldsParameters,
	APIPollFieldsParameters,
	APISpaceExpansionsParameters,
	APISpaceFieldsParameters,
	APITweetExpansionsParameters,
	APITweetFieldsParameters,
	APIUserExpansionsParameters,
	APIUserFieldsParameters,
} from 'twitter-types';

export const ClientEvents = {
	FILTERED_TWEET_CREATE: 'filteredTweetCreate',
	PARTIAL_ERROR: 'partialError',
	READY: 'ready',
	SAMPLED_TWEET_CREATE: 'sampledTweetCreate',
};

/**
 * The default options which the client gets initialized with
 */
export const defaultClientOptions: ClientOptions = {
	/**
	 * The options for the API to use
	 */
	api: {
		version: 2,
		baseURL: 'https://api.twitter.com',
	},

	/**
	 * The parameters to pass in the query of a request
	 */
	queryParameters: {
		userFields: APIUserFieldsParameters,
		// TODO: remove this once twitter fixes the bug where unauthorized request of these fields result in an error instead of a partial error
		tweetFields: APITweetFieldsParameters.filter(
			f => !['promoted_metrics', 'organic_metrics', 'non_public_metrics'].includes(f),
		),
		// TODO: remove this once twitter fixes a bug where requesting this field without `OAuth 2.0 Authorization Code with PKCE` results in an error instead of a partial error
		spaceFields: APISpaceFieldsParameters.filter(f => f !== 'subscriber_count'),
		mediaFields: APIMediaFieldsParameters,
		placeFields: APIPlaceFieldsParameters,
		pollFields: APIPollFieldsParameters,
		listFields: APIListFieldsParameters,
		tweetExpansions: APITweetExpansionsParameters,
		userExpansions: APIUserExpansionsParameters,
		spaceExpansions: APISpaceExpansionsParameters,
		listExpansions: APIListExpansionsParameters,
	},

	/**
	 * The events that the client opted-in for
	 */
	events: [],
};

export const StreamType = {
	SAMPLED: 'sampled',
	FILTERED: 'filtered',
};
