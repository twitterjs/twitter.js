import SimplifiedUser from './SimplifiedUser.js';
import SimplifiedTweet from './SimplifiedTweet.js';
import type Client from '../client/Client.js';
import type { APITweet, SingleUserLookupResponse } from 'twitter-types';

/**
 * The class that represents a Twitter user
 */
export default class User extends SimplifiedUser {
  /**
   * The tweet pinned by this user
   */
  pinnedTweet: SimplifiedTweet | null;

  constructor(client: Client, data: SingleUserLookupResponse) {
    super(client, data.data);

    this.pinnedTweet = this.#patchPinnedTweet(data.includes?.tweets) ?? null;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  #patchPinnedTweet(tweets?: Array<APITweet>): SimplifiedTweet | undefined {
    if (!tweets) return;
    const rawPinnedTweet = tweets.find(tweet => tweet.id === this.pinnedTweetID);
    if (!rawPinnedTweet) return;
    return new SimplifiedTweet(this.client, rawPinnedTweet);
  }
}
