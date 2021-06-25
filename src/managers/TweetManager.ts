import Tweet from '../structures/Tweet.js';
import BaseManager from './BaseManager.js';
import { RequestData } from '../structures/Misc.js';
import type Client from '../client/Client.js';
import type { FetchTweetOptions, TweetResolvable } from '../typings/index.js';
import type { GetSingleTweetByIdQuery, GetSingleTweetByIdResponse } from 'twitter-types';

/**
 * Holds API methods for tweets and stores their cache
 */
export default class TweetManager extends BaseManager<TweetResolvable, Tweet> {
  constructor(client: Client) {
    super(client, Tweet);
  }

  async fetch(options: FetchTweetOptions): Promise<GetSingleTweetByIdResponse | undefined> {
    if (!options) throw new Error('no options');
    const tweetId = this.resolveID(options.tweet);
    if (tweetId) {
      return this._fetchSingle(tweetId, options);
    }
  }

  private async _fetchSingle(id: string, options?: FetchTweetOptions) {
    const localQueryParameters = options?.queryParameters;
    const globalQueryParameters = this.client.options.queryParameters;
    const query: GetSingleTweetByIdQuery = {
      expansions: localQueryParameters?.tweetExpansions ?? globalQueryParameters?.tweetExpansions,
      'media.fields': localQueryParameters?.mediaFields ?? globalQueryParameters?.mediaFields,
      'place.fields': localQueryParameters?.placeFields ?? globalQueryParameters?.placeFields,
      'poll.fields': localQueryParameters?.pollFields ?? globalQueryParameters?.pollFields,
      'tweet.fields': localQueryParameters?.tweetFields ?? globalQueryParameters?.tweetFields,
      'user.fields': localQueryParameters?.userFields ?? globalQueryParameters?.userFields,
    };
    const requestData = new RequestData(query, null, false);
    const data: GetSingleTweetByIdResponse = await this.client._api.tweets(id).get(requestData);
    return data;
  }
}
