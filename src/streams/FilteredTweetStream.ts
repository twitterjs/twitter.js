import BaseStream from './BaseStream.js';
import { RequestData } from '../structures/misc/Misc.js';
import type { ClientInUse, ClientUnionType } from '../typings/index.js';
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
import { ClientEvents } from '../util/Constants.js';

export default class FilteredTweetStream<C extends ClientUnionType> extends BaseStream<C> {
  constructor(client: ClientInUse<C>) {
    super(client);

    if (this.client.options.events.includes('FILTERED_TWEET_CREATE')) {
      this.#connect();
    }
  }

  async fetchRules(ids?: Array<Snowflake>): Promise<GetFilteredTweetStreamRulesResponse> {
    const query: GetFilteredTweetStreamRulesQuery = {
      ids,
    };
    const requestData = new RequestData(query, null);
    const data: GetFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.get(
      requestData,
    );
    return data;
  }

  async addRules(rules: Array<{ value: string; tag?: string }>): Promise<PostAddFilteredTweetStreamRulesResponse> {
    const body: PostAddFilteredTweetStreamRulesJSONBody = {
      add: rules,
    };
    const requestData = new RequestData(null, body);
    const data: PostAddFilteredTweetStreamRulesResponse = await this.client._api.tweets.search.stream.rules.post(
      requestData,
    );
    return data;
  }

  async deleteRulesByIds(ids: Array<Snowflake>): Promise<PostRemoveFilteredTweetStreamRulesResponse> {
    const body: PostRemoveFilteredTweetStreamRulesByIdsJSONBody = {
      delete: {
        ids,
      },
    };
    return this.#deleteRules(body);
  }

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
    const requestData = new RequestData(null, body);
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
    const requestData = new RequestData(query, null, true);
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
