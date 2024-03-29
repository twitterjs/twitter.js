import { Collection } from '../util';
import { BaseBook, type BaseBookOptions } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type Tweet } from '../structures';
import type { Client } from '../client';
import type { GETListsIdTweetsQuery, GETListsIdtweetsResponse } from 'twitter-types';
import type { ListResolvable } from '../managers';

/**
 * A class for fetching tweets from a list
 */
export class ListTweetsBook extends BaseBook {
	/**
	 * The Id of the list this book belongs to
	 */
	listId: string;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: ListTweetsBookOptions) {
		super(client, options);
		const listId = client.lists.resolveId(options.list);
		if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'create ListTweetsBook for');
		this.listId = listId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweet} belonging to the given list
	 */
	async fetchNextPage(): Promise<Collection<string, Tweet>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	/**
	 * Fetches the previous page of the book if there is one.
	 * @returns A {@link Collection} of {@link Tweet} belonging to the given list
	 */
	async fetchPreviousPage(): Promise<Collection<string, Tweet>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<string, Tweet>> {
		const tweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETListsIdTweetsQuery = {
			expansions: queryParameters?.tweetExpansions,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
			pagination_token: token,
		};
		if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
		const requestData = new RequestData({ query });
		const data: GETListsIdtweetsResponse = await this.client._api.lists(this.listId).tweets.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return tweets;
		const rawTweets = data.data;
		const rawIncludes = data.includes;
		for (const rawTweet of rawTweets) {
			const tweet = this.client.tweets._add(rawTweet.id, { data: rawTweet, includes: rawIncludes }, false);
			tweets.set(tweet.id, tweet);
		}
		return tweets;
	}
}

export interface ListTweetsBookOptions extends BaseBookOptions {
	list: ListResolvable;
}
