import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { RequestData, FilteredStreamRule } from '../structures';
import type { Client } from '../client';
import type {
	FetchFilteredStreamRuleOptions,
	FetchFilteredStreamRulesOptions,
	FilteredStreamRuleData,
	FilteredStreamRuleManagerFetchResult,
	FilteredStreamRuleResolvable,
} from '../typings';
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
	 * Fetches one or multiple rules that are currently active.
	 * @param options The options for fetching rules
	 * @returns A {@link FilteredStreamRule} or a {@link Collection} of them
	 * @example
	 * // Fetch all active rules
	 * const rules = await client.filteredStreamRules.fetch();
	 *
	 * // Fetch a single active rule
	 * const rule = await client.filteredStreamRules.fetch({ rule: '1459555165208338435' });
	 *
	 * // Fetch multiple active rules
	 * const rules = await client.filteredStreamRules.fetch({ rules: ['1459555165208338435', '1488046998351925250'] });
	 */
	async fetch<T extends FetchFilteredStreamRuleOptions | FetchFilteredStreamRulesOptions>(
		options?: T,
	): Promise<FilteredStreamRuleManagerFetchResult<T>> {
		if (typeof options === 'undefined') {
			return this.#fetchMultipleRules() as Promise<FilteredStreamRuleManagerFetchResult<T>>;
		} else if ('rule' in options) {
			const ruleId = this.resolveId(options.rule);
			if (!ruleId) throw new CustomError('RULE_RESOLVE_ID', 'fetch');
			return this.#fetchSingleRule(ruleId, options) as Promise<FilteredStreamRuleManagerFetchResult<T>>;
		} else if ('rules' in options) {
			if (typeof options.rules === 'undefined') {
				return this.#fetchMultipleRules(options.rules, options) as Promise<FilteredStreamRuleManagerFetchResult<T>>;
			}
			if (!Array.isArray(options.rules)) {
				throw new CustomTypeError('INVALID_TYPE', 'rules', 'array or undefined', true);
			}
			const ruleIds = options.rules.map(rule => {
				const ruleId = this.resolveId(rule);
				if (!ruleId) throw new CustomError('RULE_RESOLVE_ID', 'fetch');
				return ruleId;
			});
			return this.#fetchMultipleRules(ruleIds, options) as Promise<FilteredStreamRuleManagerFetchResult<T>>;
		}
		return this.#fetchMultipleRules() as Promise<FilteredStreamRuleManagerFetchResult<T>>;
	}

	/**
	 * Creates rules for the filtered stream.
	 * @param data The data for creating rules
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
	 * Deletes rules for the filtered stream using their ids.
	 * @param ruleId The id or ids of the rules to delete
	 * @example
	 * // Delete a single rule
	 * const data = await client.filteredStreamRules.deleteById('1488053806785245187');
	 *
	 * // Delete multiple rules
	 * const data = await client.filteredStreamRules.deleteById(['1488048453506957314', '1488053806785245186']);
	 */
	async deleteById(ruleId: string | Array<string>): Promise<POSTTweetsSearchStreamRulesResponse> {
		const ids = Array.isArray(ruleId) ? ruleId : [ruleId];
		const body: POSTTweetsSearchStreamRulesJSONBody = {
			delete: {
				ids,
			},
		};
		return this.#deleteRules(body);
	}

	/**
	 * Deletes rules for the filtered stream using their values.
	 * @param ruleValue The value or values of the rules to delete
	 * @example
	 * // Delete a single rule
	 * const data = await client.filteredStreamRules.deleteByValue('@iShiibi');
	 *
	 * // Delete multiple rules
	 * const data = await client.filteredStreamRules.deleteByValue(['from:iShiibi', 'to:TwitterAPI']);
	 */
	async deleteByValue(ruleValue: string | Array<string>): Promise<POSTTweetsSearchStreamRulesResponse> {
		const values = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
		const body: POSTTweetsSearchStreamRulesJSONBody = {
			delete: {
				values,
			},
		};
		return this.#deleteRules(body);
	}

	/**
	 * Delete rules for the filtered stream.
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
	 * @param options The options for fetching the rule
	 * @returns A {@link FilteredStreamRule}
	 */
	async #fetchSingleRule(ruleId: string, options: FetchFilteredStreamRuleOptions): Promise<FilteredStreamRule> {
		if (!options.skipCacheCheck) {
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
		return this._add(rawRule.id, rawRule, options.cacheAfterFetching);
	}

	/**
	 * Fetches multiple rules by using their ids.
	 * @param ruleIds The ids of the rules to fetch
	 * @param options The options for fetching the rules
	 * @returns A {@link Collection} of {@link FilteredStreamRule}
	 */
	async #fetchMultipleRules(
		ruleIds?: Array<string>,
		options?: FetchFilteredStreamRulesOptions,
	): Promise<Collection<string, FilteredStreamRule>> {
		const fetchedRules = new Collection<string, FilteredStreamRule>();
		const query: GETTweetsSearchStreamRulesQuery = {
			ids: ruleIds,
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
