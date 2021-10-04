import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { RequestData, FilteredStreamRule } from '../structures';
import type { Client } from '../client';
import type {
  CreateFilteredStreamRuleOptions,
  CreateFilteredStreamRulesOptions,
  FetchFilteredStreamRuleOptions,
  FetchFilteredStreamRulesOptions,
  FilteredStreamRuleManagerFetchResult,
  FilteredStreamRuleResolvable,
} from '../typings';
import type {
  GetFilteredTweetStreamRulesQuery,
  GetFilteredTweetStreamRulesResponse,
  PostAddFilteredTweetStreamRulesJSONBody,
  PostAddFilteredTweetStreamRulesResponse,
  PostRemoveFilteredTweetStreamRulesByIdsJSONBody,
  PostRemoveFilteredTweetStreamRulesByValuesJSONBody,
  PostRemoveFilteredTweetStreamRulesResponse,
  Snowflake,
} from 'twitter-types';

export class FilteredStreamRuleManager extends BaseManager<
  Snowflake,
  FilteredStreamRuleResolvable,
  FilteredStreamRule
> {
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
   */
  async fetch<T extends FetchFilteredStreamRuleOptions | FetchFilteredStreamRulesOptions>(
    options?: T,
  ): Promise<FilteredStreamRuleManagerFetchResult<T>> {
    if (typeof options === 'undefined') {
      return this.#fetchMultipleRules() as Promise<FilteredStreamRuleManagerFetchResult<T>>;
    } else if ('rule' in options) {
      const ruleId = this.resolveId(options.rule);
      if (!ruleId) throw new CustomError('TODO', 'fetch');
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
        if (!ruleId) throw new CustomError('TODO', 'fetch');
        return ruleId;
      });
      return this.#fetchMultipleRules(ruleIds, options) as Promise<FilteredStreamRuleManagerFetchResult<T>>;
    }
    return this.#fetchMultipleRules() as Promise<FilteredStreamRuleManagerFetchResult<T>>;
  }

  /**
   * Creates one or multiple rules for the filtered stream.
   * @param options The options for creating rules
   * @returns A {@link Collection} of {@link FilteredStreamRule} objects
   */
  async create<T extends CreateFilteredStreamRuleOptions | CreateFilteredStreamRulesOptions>(
    options: T,
  ): Promise<Collection<Snowflake, FilteredStreamRule>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    const rules = 'rule' in options ? [options.rule] : options.rules;
    const body: PostAddFilteredTweetStreamRulesJSONBody = {
      add: rules,
    };
    const requestData = new RequestData({ body });
    const res: PostAddFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return res.data.reduce((rulesCollection, rawRule) => {
      const rule = this.add(rawRule.id, rawRule);
      return rulesCollection.set(rule.id, rule);
    }, new Collection<Snowflake, FilteredStreamRule>());
  }

  /**
   * Deletes rules for the filtered tweeet stream using their ids.
   * @param ids The ids of the rules to delete
   */
  async deleteRulesByIds(ids: Array<Snowflake>): Promise<PostRemoveFilteredTweetStreamRulesResponse> {
    const body: PostRemoveFilteredTweetStreamRulesByIdsJSONBody = {
      delete: {
        ids,
      },
    };
    return this.#deleteRules(body);
  }

  /**
   * Deletes rules for the filtered tweet stream using their values.
   * @param values The values of the rules to delete
   */
  async deleteRulesByValues(values: Array<string>): Promise<PostRemoveFilteredTweetStreamRulesResponse> {
    const body: PostRemoveFilteredTweetStreamRulesByValuesJSONBody = {
      delete: {
        values,
      },
    };
    return this.#deleteRules(body);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #deleteRules(
    body: PostRemoveFilteredTweetStreamRulesByIdsJSONBody | PostRemoveFilteredTweetStreamRulesByValuesJSONBody,
  ): Promise<PostRemoveFilteredTweetStreamRulesResponse> {
    const requestData = new RequestData({ body });
    const res: PostRemoveFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return res;
  }

  async #fetchSingleRule(ruleId: Snowflake, options: FetchFilteredStreamRuleOptions): Promise<FilteredStreamRule> {
    if (!options.skipCacheCheck) {
      const cachedRule = this.cache.get(ruleId);
      if (cachedRule) return cachedRule;
    }
    const query: GetFilteredTweetStreamRulesQuery = {
      ids: [ruleId],
    };
    const requestData = new RequestData({ query });
    const res: GetFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.get(requestData);
    const rawRule = res.data[0];
    return this.add(rawRule.id, rawRule, options.cacheAfterFetching);
  }

  async #fetchMultipleRules(
    ruleIds?: Array<Snowflake>,
    options?: FetchFilteredStreamRulesOptions,
  ): Promise<Collection<Snowflake, FilteredStreamRule>> {
    const fetchedRules = new Collection<Snowflake, FilteredStreamRule>();
    const query: GetFilteredTweetStreamRulesQuery = {
      ids: ruleIds,
    };
    const requestData = new RequestData({ query });
    const res: GetFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.get(requestData);
    const rawRules = res.data;
    for (const rawRule of rawRules) {
      const rule = this.add(rawRule.id, rawRule, options?.cacheAfterFetching);
      fetchedRules.set(rule.id, rule);
    }
    return fetchedRules;
  }
}
