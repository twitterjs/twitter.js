import Tweet from '../structures/Tweet.js';
import BaseManager from './BaseManager.js';
import { RequestData } from '../structures/Misc.js';
import type Client from '../client/Client.js';
import type { TweetResolvable } from '../typings/index.js';

/**
 * Holds API methods for tweets and stores their cache
 */
export default class TweetManager extends BaseManager<TweetResolvable, Tweet> {
  constructor(client: Client) {
    super(client, Tweet);
  }

  async fetch(id: string): Promise<any> {
    const tweetId = this.resolveID(id);
    if (tweetId) {
      return this._fetchSingle(id);
    }
  }

  private async _fetchSingle(id: string) {
    const requestData = new RequestData(null, null, false);
    const data = await this.client._api.tweets(id).get(requestData);
    return data;
  }
}
