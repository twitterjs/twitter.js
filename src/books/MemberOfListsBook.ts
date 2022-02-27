import { Collection } from '../util';
import { BaseBook, type BaseBookOptions } from './BaseBook';
import { CustomError } from '../errors';
import { type List, RequestData } from '../structures';
import type { Client } from '../client';
import type { GETUsersIdListMembershipsQuery, GETUsersIdListMembershipsResponse } from 'twitter-types';
import type { UserResolvable } from '../managers';

/**
 * A class for fetching lists in which a user is a member
 */
export class MemberOfListsBook extends BaseBook {
	/**
	 * The Id of the user this book belongs to
	 */
	userId: string;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param options The options to initialize the book with
	 */
	constructor(client: Client, options: MemberOfListsBookOptions) {
		super(client, options);
		const userId = client.users.resolveId(options.user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'create MemberOfListsBook for');
		this.userId = userId;
	}

	/**
	 * Fetches the next page of the book if there is one.
	 * @returns A {@link Collection} of {@link List} in which the given user is a member
	 */
	async fetchNextPage(): Promise<Collection<string, List>> {
		if (!this._hasMadeInitialRequest) {
			this._hasMadeInitialRequest = true;
			return this.#fetchPages();
		}
		if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
		return this.#fetchPages(this._nextToken);
	}

	/**
	 * Fetches the previous page of the book if there is one.
	 * @returns A {@link Collection} of {@link List} in which the given user is a member
	 */
	async fetchPreviousPage(): Promise<Collection<string, List>> {
		if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
		return this.#fetchPages(this._previousToken);
	}

	async #fetchPages(token?: string): Promise<Collection<string, List>> {
		const lists = new Collection<string, List>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETUsersIdListMembershipsQuery = {
			expansions: queryParameters?.listExpansions,
			'user.fields': queryParameters?.userFields,
			'list.fields': queryParameters?.listFields,
			pagination_token: token,
		};
		if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
		const requestData = new RequestData({ query });
		const data: GETUsersIdListMembershipsResponse = await this.client._api
			.users(this.userId)
			.list_memberships.get(requestData);
		this._nextToken = data.meta.next_token;
		this._previousToken = data.meta.previous_token;
		this.hasMore = data.meta.next_token ? true : false;
		if (data.meta.result_count === 0) return lists;
		const rawLists = data.data;
		const rawIncludes = data.includes;
		for (const rawList of rawLists) {
			const list = this.client.lists._add(rawList.id, { data: rawList, includes: rawIncludes }, false);
			lists.set(list.id, list);
		}
		return lists;
	}
}

export interface MemberOfListsBookOptions extends BaseBookOptions {
	user: UserResolvable;
}
