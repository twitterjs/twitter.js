import Tweet from '../structures/Tweet.js';
import { ClientEvents } from '../util/Constants.js';
import { RequestData } from '../structures/misc/Misc.js';
import type { GetSampledTweetStreamQuery } from 'twitter-types';
import type { ClientInUse, ClientUnionType } from '../typings/Types';

export async function createSampledStream<C extends ClientUnionType>(client: ClientInUse<C>): Promise<void> {
  const queryParameters = client.options.queryParameters;
  const query: GetSampledTweetStreamQuery = {
    expansions: queryParameters?.tweetExpansions,
    'media.fields': queryParameters?.mediaFields,
    'place.fields': queryParameters?.placeFields,
    'poll.fields': queryParameters?.pollFields,
    'tweet.fields': queryParameters?.tweetFields,
    'user.fields': queryParameters?.userFields,
  };
  const requestData = new RequestData(query, null, true);
  const responseStream = await client._api.tweets.sample.stream.get(requestData);
  try {
    for await (const chunk of responseStream.body) {
      const stringifiedChunk = chunk.toString();
      try {
        const data = JSON.parse(stringifiedChunk);
        const tweet = new Tweet(client, data);
        client.emit(ClientEvents.SAMPLED_TWEET_CREATE, tweet);
      } catch (error) {
        // Find a way to fix the error where it's not able to parse
      }
    }
  } catch (err) {
    // TODO: add a reconnection mechanism
  }
}
