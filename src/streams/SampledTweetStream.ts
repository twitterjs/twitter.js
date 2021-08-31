import BaseStream from './BaseStream.js';
import Tweet from '../structures/Tweet.js';
import { ClientEvents } from '../util/Constants.js';
import { RequestData } from '../structures/misc/Misc.js';
import type Client from '../client/Client.js';
import type { GetSampledTweetStreamQuery } from 'twitter-types';

export default class SampleTweetStream extends BaseStream {
  constructor(client: Client) {
    super(client);

    if (this.client.options.events.includes('SAMPLED_TWEET_CREATE')) {
      this.#connect();
    }
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #connect(): Promise<void> {
    const queryParameters = this.client.options.queryParameters;
    const query: GetSampledTweetStreamQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null, true);
    const sampledTweetStreamResponse = await this.client._api.tweets.sample.stream.get(requestData);
    try {
      for await (const chunk of sampledTweetStreamResponse.body) {
        const stringifiedChunk = chunk.toString();
        try {
          const data = JSON.parse(stringifiedChunk);
          const tweet = new Tweet(this.client, data);
          this.client.emit(ClientEvents.SAMPLED_TWEET_CREATE, tweet);
        } catch (error) {
          // Find a way to fix the error where it's not able to parse
        }
      }
    } catch (err) {
      // TODO: add a reconnection mechanism
    }
  }
}
