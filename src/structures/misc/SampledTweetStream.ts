import Tweet from '../Tweet.js';
import { EventEmitter } from 'events';
import { RequestData } from './Misc.js';
import type { GetSampledTweetStreamQuery } from 'twitter-types';
import type { SampledTweetStreamEventsMapping } from '../../typings/Interfaces.js';
import type {
  ClientInUse,
  ClientUnionType,
  SampledTweetStreamEventArgsType,
  SampledTweetStreamEventKeyType,
  SampledTweetStreamEventListenerType,
} from '../../typings/Types';

export default class SampledTweetStream<C extends ClientUnionType> extends EventEmitter {
  client: ClientInUse<C>;

  constructor(client: ClientInUse<C>) {
    super();
    this.client = client;
    this.#manageIncomingTweets();
  }

  async #manageIncomingTweets(): Promise<void> {
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
    const responseStream = await this.client._api.tweets.sample.stream.get(requestData);
    try {
      for await (const chunk of responseStream.body) {
        const stringifiedChunk = chunk.toString();
        try {
          const data = JSON.parse(stringifiedChunk);
          const tweet = new Tweet(this.client, data);
          this.emit('sampledTweetCreate', tweet);
        } catch (error) {
          // Find a way to fix the error where it's not able to parse
        }
      }
    } catch (err) {
      // TODO: add a reconnection mechanism
    }
  }

  override on<K extends keyof SampledTweetStreamEventsMapping<C> | symbol>(
    event: SampledTweetStreamEventKeyType<K, C>,
    listener: (...args: SampledTweetStreamEventListenerType<K, C>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  override once<K extends keyof SampledTweetStreamEventsMapping<C> | symbol>(
    event: SampledTweetStreamEventKeyType<K, C>,
    listener: (...args: SampledTweetStreamEventListenerType<K, C>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  override emit<K extends keyof SampledTweetStreamEventsMapping<C> | symbol>(
    event: SampledTweetStreamEventKeyType<K, C>,
    ...args: SampledTweetStreamEventArgsType<K, C>
  ): boolean {
    return super.emit(event, ...args);
  }
}
