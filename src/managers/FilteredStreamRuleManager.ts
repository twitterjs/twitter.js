import { Collection } from '../util';
import { type BaseFetchOptions, BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { RequestData, FilteredStreamRule } from '../structures';
import type { Client } from '../client';
import type {
	GETTweetsSearchStreamRulesQuery,
	GETTweetsSearchStreamRulesResponse,
	POSTTweetsSearchStreamRulesJSONBody,
	POSTTweetsSearchStreamRulesResponse,
} from 'twitter-types';

export class FilteredStreamRuleManager extends BaseManager<string, FilteredStreamRuleResolvable, FilteredStreamRule> {
	/**
	 * @param client The logged in {@link Client} instance
	 */
	constructor(client: Client) {
		super(client, FilteredStreamRule);
	}

	/**
	 * Fetches one or multiple rules that are currently active. Fetches all active rules if `rulesOrRules` is an empty array.
	 * @param ruleOrRules The rule or rules to fetch or an empty array
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link FilteredStreamRule} or a {@link Collection} of them
	 * @example
	 * // Fetch a single active rule
	 * const rule = await client.filteredStreamRules.fetch('1459555165208338435');
	 *
	 * // Fetch multiple active rules
	 * const rules = await client.filteredStreamRules.fetch(['1459555165208338435', '1488046998351925250']);
	 *
	 * // Fetch all active rules
	 * const rules = await client.filteredStreamRules.fetch([]);
	 */
	async fetch<R extends FilteredStreamRuleResolvable | Array<FilteredStreamRuleResolvable>>(
		ruleOrRules: R,
		options?: FetchFilteredStreamRuleOrRulesOptions<R>,
	): Promise<FilteredStreamRuleManagerFetchResult<R>> {
		if (Array.isArray(ruleOrRules)) {
			if (ruleOrRules.length) {
				const ruleIds = ruleOrRules.map(rule => {
					const ruleId = this.resolveId(rule);
					if (!ruleId) throw new CustomError('RULE_RESOLVE_ID', 'fetch');
					return ruleId;
				});
				// @ts-expect-error TS seems to not work when conditional types and promises are combined together
				return this.#fetchMultipleRulesByIds(ruleIds, options);
			}
			// @ts-expect-error TS seems to not work when conditional types and promises are combined together
			return this.#fetchMultipleRulesByIds([], options);
		}
		const ruleId = this.resolveId(ruleOrRules);
		if (!ruleId) throw new CustomError('RULE_RESOLVE_ID', 'fetch');
		// @ts-expect-error TS seems to not work when conditional types and promises are combined together
		return this.#fetchSingleRuleById(ruleId, options);
	}

	/**
	 * Creates one or more rules for the filtered stream.
	 * @param data The data for creating one or more rules
	 * @returns A {@link Collection} of {@link FilteredStreamRule}
	 * @example
	 * // Create a single rule
	 * const rule = await client.filteredStreamRules.create({ value: '@iShiibi', tag: 'Tweets mentioning the user iShiibi' });
	 *
	 * // Create multiple rules
	 * const rules = await client.filteredStreamRules.create([
	 * { value: 'from:iShiibi', tag: 'Tweets created by the user iShiibi' },
	 * { value: 'to:TwitterAPI', tag: 'Tweets that are replies to tweets created by the user TwitterAPI' },
	 * ]);
	 */
	async create(
		data: FilteredStreamRuleData | Array<FilteredStreamRuleData>,
	): Promise<Collection<string, FilteredStreamRule>> {
		const rules = Array.isArray(data) ? data : [data];
		const body: POSTTweetsSearchStreamRulesJSONBody = {
			add: rules,
		};
		const requestData = new RequestData({ body });
		const res: POSTTweetsSearchStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
			requestData,
		);
		return (
			res.data?.reduce((createdRules, rawRule) => {
				const rule = this._add(rawRule.id, rawRule);
				return createdRules.set(rule.id, rule);
			}, new Collection<string, FilteredStreamRule>()) ?? new Collection<string, FilteredStreamRule>()
		);
	}

	/**
	 * Deletes one or more filtered stream rules using their ids.
	 * @param ruleIdOrIds The id or ids of the rules to delete
	 * @example
	 * // Delete a single rule
	 * const data = await client.filteredStreamRules.deleteById('1488053806785245187');
	 *
	 * // Delete multiple rules
	 * const data = await client.filteredStreamRules.deleteById(['1488048453506957314', '1488053806785245186']);
	 */
	async deleteById(ruleIdOrIds: string | Array<string>): Promise<POSTTweetsSearchStreamRulesResponse> {
		const ids = Array.isArray(ruleIdOrIds) ? ruleIdOrIds : [ruleIdOrIds];
		const body: POSTTweetsSearchStreamRulesJSONBody = {
			delete: {
				ids,
			},
		};
		return this.#deleteRules(body);
	}

	/**
	 * Deletes one or more filtered stream rules using their values.
	 * @param ruleValueOrValues The value or values of the rules to delete
	 * @example
	 * // Delete a single rule
	 * const data = await client.filteredStreamRules.deleteByValue('@iShiibi');
	 *
	 * // Delete multiple rules
	 * const data = await client.filteredStreamRules.deleteByValue(['from:iShiibi', 'to:TwitterAPI']);
	 */
	async deleteByValue(ruleValueOrValues: string | Array<string>): Promise<POSTTweetsSearchStreamRulesResponse> {
		const values = Array.isArray(ruleValueOrValues) ? ruleValueOrValues : [ruleValueOrValues];
		const body: POSTTweetsSearchStreamRulesJSONBody = {
			delete: {
				values,
			},
		};
		return this.#deleteRules(body);
	}

	/**
	 * Deletes one or more filtered stream rules.
	 * @param body The request body
	 * @returns // TODO
	 */
	async #deleteRules(body: POSTTweetsSearchStreamRulesJSONBody): Promise<POSTTweetsSearchStreamRulesResponse> {
		const requestData = new RequestData({ body });
		const res: POSTTweetsSearchStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
			requestData,
		);
		return res;
	}

	/**
	 * Fetches a single rule by using its id.
	 * @param ruleId The id of the rule to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link FilteredStreamRule}
	 */
	async #fetchSingleRuleById(ruleId: string, options?: FetchFilteredStreamRuleOptions): Promise<FilteredStreamRule> {
		if (!options?.skipCacheCheck) {
			const cachedRule = this.cache.get(ruleId);
			if (cachedRule) return cachedRule;
		}
		const query: GETTweetsSearchStreamRulesQuery = {
			ids: [ruleId],
		};
		const requestData = new RequestData({ query });
		const res: GETTweetsSearchStreamRulesResponse = await this.client._api.tweets.search.stream.rules.get(requestData);
		const rawRule = res.data?.[0];
		if (!rawRule) throw new CustomError('RULE_NOT_FOUND');
		return this._add(rawRule.id, rawRule, options?.cacheAfterFetching);
	}

	/**
	 * Fetches multiple rules by using their ids or all rules if `ruleIds` is an empty array.
	 * @param ruleIds The ids of the rules to fetch or an empty array
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link FilteredStreamRule}
	 */
	async #fetchMultipleRulesByIds(
		ruleIds: Array<string>,
		options?: FetchFilteredStreamRulesOptions,
	): Promise<Collection<string, FilteredStreamRule>> {
		if (!Array.isArray(ruleIds)) throw new CustomTypeError('INVALID_TYPE', 'rulesIds', 'array', true);
		const fetchedRules = new Collection<string, FilteredStreamRule>();
		const query: GETTweetsSearchStreamRulesQuery = {
			ids: ruleIds.length ? ruleIds : undefined,
		};
		const requestData = new RequestData({ query });
		const res: GETTweetsSearchStreamRulesResponse = await this.client._api.tweets.search.stream.rules.get(requestData);
		const rawRules = res.data;
		if (!rawRules?.length) return fetchedRules;
		for (const rawRule of rawRules) {
			const rule = this._add(rawRule.id, rawRule, options?.cacheAfterFetching);
			fetchedRules.set(rule.id, rule);
		}
		return fetchedRules;
	}
}

/**
 * Options used to feth a single filtered stream rule
 */
export type FetchFilteredStreamRuleOptions = BaseFetchOptions;

/**
 * Options used to feth multiple filtered stream rules
 */
export type FetchFilteredStreamRulesOptions = Omit<BaseFetchOptions, 'skipCacheCheck'>;

/**
 * Options used to fetch one or more filter stream rules
 */
export type FetchFilteredStreamRuleOrRulesOptions<
	R extends FilteredStreamRuleResolvable | Array<FilteredStreamRuleResolvable>,
> = R extends FilteredStreamRuleResolvable ? FetchFilteredStreamRuleOptions : FetchFilteredStreamRulesOptions;

export type FilteredStreamRuleManagerFetchResult<
	R extends FilteredStreamRuleResolvable | Array<FilteredStreamRuleResolvable>,
> = R extends FilteredStreamRuleResolvable ? FilteredStreamRule : Collection<string, FilteredStreamRule>;

/**
 * Options used to create a new filtered stream rule
 */
export interface FilteredStreamRuleData {
	/**
	 * The value of the rule
	 * @see https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query
	 */
	value: string;

	/**
	 * The label of the rule
	 */
	tag?: string;
}

export type FilteredStreamRuleResolvable = FilteredStreamRule | string;
