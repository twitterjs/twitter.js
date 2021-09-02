import { BaseStream } from './BaseStream.js';
import { Collection } from '../util/Collection.js';
import { ClientEvents } from '../util/Constants.js';
import { RequestData } from '../structures/misc/Misc.js';
import { FilteredTweetStreamRule } from '../structures/FilteredTweetStreamRule.js';
import type { Client } from '../client/Client.js';
import type { FilteredTweetStreamAddRuleOptions, FilteredTweetStreamRuleResolvable } from '../typings/index.js';
import type {
  GetFilteredTweetStreamQuery,
  GetFilteredTweetStreamResponse,
  GetFilteredTweetStreamRulesQuery,
  GetFilteredTweetStreamRulesResponse,
  PostAddFilteredTweetStreamRulesJSONBody,
  PostAddFilteredTweetStreamRulesResponse,
  PostRemoveFilteredTweetStreamRulesByIdsJSONBody,
  PostRemoveFilteredTweetStreamRulesByValuesJSONBody,
  PostRemoveFilteredTweetStreamRulesResponse,
  Snowflake,
} from 'twitter-types';

export class FilteredTweetStream extends BaseStream {
  constructor(client: Client) {
    super(client);

    if (this.client.options.events.includes('FILTERED_TWEET_CREATE')) {
      this.#connect();
    }
  }

  /**
   * Fetches rules that are currently active
   * @param rules The rules to fetch, fetches all rules if not provided
   * @returns A {@link Collection} of {@link FilteredTweetStreamRule} objects
   */
  async fetchRules(
    rules?: Array<FilteredTweetStreamRuleResolvable>,
  ): Promise<Collection<Snowflake, FilteredTweetStreamRule>> {
    const ids = rules?.map(rule => (typeof rule === 'string' ? rule : rule?.id));
    const query: GetFilteredTweetStreamRulesQuery = {
      ids,
    };
    const requestData = new RequestData({ query });
    const data: GetFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.get(
      requestData,
    );
    const fetchedRulesCollection = new Collection<Snowflake, FilteredTweetStreamRule>();
    if (!data.data || data.data.length === 0) return fetchedRulesCollection;
    return data.data.reduce((rulesCollection, rawRule) => {
      const rule = new FilteredTweetStreamRule(this.client, rawRule);
      return rulesCollection.set(rule.id, rule);
    }, fetchedRulesCollection);
  }

  /**
   * Creates new rules for the filtered tweet stream
   * @param rules The rules to add
   * @returns A {@link Collection} of {@link FilteredTweetStreamRule} objects
   */
  async addRules(
    rules: Array<FilteredTweetStreamAddRuleOptions>,
  ): Promise<Collection<Snowflake, FilteredTweetStreamRule>> {
    const body: PostAddFilteredTweetStreamRulesJSONBody = {
      add: rules,
    };
    const requestData = new RequestData({ body });
    const data: PostAddFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return data.data.reduce((rulesCollection, rawRule) => {
      const rule = new FilteredTweetStreamRule(this.client, rawRule);
      return rulesCollection.set(rule.id, rule);
    }, new Collection<Snowflake, FilteredTweetStreamRule>());
  }

  /**
   * Deletes rules for the filtered tweeet stream using their ids
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
   * Deletes rules for the filtered tweet stream using their values
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
    const data: PostRemoveFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return data;
  }

  async #connect(): Promise<void> {
    const queryParameters = this.client.options.queryParameters;
    const query: GetFilteredTweetStreamQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query, isStreaming: true });
    const filteredTweetStreamResponse = await this.client._api.tweets.search.stream.get(requestData);
    try {
      for await (const chunk of filteredTweetStreamResponse.body) {
        const stringifiedChunk = chunk.toString();
        try {
          const data: GetFilteredTweetStreamResponse = JSON.parse(stringifiedChunk);
          const tweet = this.client.tweets.add(data.data.id, data);
          this.client.emit(ClientEvents.FILTERED_TWEET_CREATE, tweet);
        } catch (error) {
          // Find a way to fix the error where it's not able to parse
        }
      }
    } catch (err) {
      // TODO: add a reconnection mechanism
    }
  }
}
