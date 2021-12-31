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
  GET_2_tweets_search_stream_rules_Query,
  GET_2_tweets_search_stream_rules_Response,
  POST_2_tweets_search_stream_rules_JSONBody,
  POST_2_tweets_search_stream_rules_Response,
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
   * Creates one or multiple rules for the filtered stream.
   * @param data The data for creating rules
   * @returns A {@link Collection} of {@link FilteredStreamRule} objects
   */
  async create(
    data: FilteredStreamRuleData | Array<FilteredStreamRuleData>,
  ): Promise<Collection<Snowflake, FilteredStreamRule>> {
    const rules = Array.isArray(data) ? data : [data];
    const body: POST_2_tweets_search_stream_rules_JSONBody = {
      add: rules,
    };
    const requestData = new RequestData({ body });
    const res: POST_2_tweets_search_stream_rules_Response = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return (
      res.data?.reduce((createdRules, rawRule) => {
        const rule = this._add(rawRule.id, rawRule);
        return createdRules.set(rule.id, rule);
      }, new Collection<Snowflake, FilteredStreamRule>()) ?? new Collection<Snowflake, FilteredStreamRule>()
    );
  }

  /**
   * Deletes one or multiple rules for the filtered stream using their ids.
   * @param ruleId The id or ids of the rules to delete
   */
  async deleteById(ruleId: Snowflake | Array<Snowflake>): Promise<POST_2_tweets_search_stream_rules_Response> {
    const ids = Array.isArray(ruleId) ? ruleId : [ruleId];
    const body: POST_2_tweets_search_stream_rules_JSONBody = {
      delete: {
        ids,
      },
    };
    return this.#deleteRules(body);
  }

  /**
   * Deletes one or multiple rules for the filtered stream using their values.
   * @param ruleValue The value or values of the rules to delete
   */
  async deleteByValue(ruleValue: string | Array<string>): Promise<POST_2_tweets_search_stream_rules_Response> {
    const values = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
    const body: POST_2_tweets_search_stream_rules_JSONBody = {
      delete: {
        values,
      },
    };
    return this.#deleteRules(body);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #deleteRules(
    body: POST_2_tweets_search_stream_rules_JSONBody,
  ): Promise<POST_2_tweets_search_stream_rules_Response> {
    const requestData = new RequestData({ body });
    const res: POST_2_tweets_search_stream_rules_Response = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return res;
  }

  async #fetchSingleRule(ruleId: Snowflake, options: FetchFilteredStreamRuleOptions): Promise<FilteredStreamRule> {
    if (!options.skipCacheCheck) {
      const cachedRule = this.cache.get(ruleId);
      if (cachedRule) return cachedRule;
    }
    const query: GET_2_tweets_search_stream_rules_Query = {
      ids: [ruleId],
    };
    const requestData = new RequestData({ query });
    const res: GET_2_tweets_search_stream_rules_Response = await this.client._api.tweets.search.stream.rules.get(
      requestData,
    );
    const rawRule = res.data?.[0];
    if (!rawRule) throw new CustomError('RULE_NOT_FOUND');
    return this._add(rawRule.id, rawRule, options.cacheAfterFetching);
  }

  async #fetchMultipleRules(
    ruleIds?: Array<Snowflake>,
    options?: FetchFilteredStreamRulesOptions,
  ): Promise<Collection<Snowflake, FilteredStreamRule>> {
    const fetchedRules = new Collection<Snowflake, FilteredStreamRule>();
    const query: GET_2_tweets_search_stream_rules_Query = {
      ids: ruleIds,
    };
    const requestData = new RequestData({ query });
    const res: GET_2_tweets_search_stream_rules_Response = await this.client._api.tweets.search.stream.rules.get(
      requestData,
    );
    const rawRules = res.data;
    if (!rawRules?.length) return fetchedRules;
    for (const rawRule of rawRules) {
      const rule = this._add(rawRule.id, rawRule, options?.cacheAfterFetching);
      fetchedRules.set(rule.id, rule);
    }
    return fetchedRules;
  }
}
