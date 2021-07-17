import SimplifiedUser from './SimplifiedUser.js';
import SimplifiedTweet from './SimplifiedTweet.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { APITweet, GetSingleUserByIdResponse } from 'twitter-types';

/**
 * The class that represents a Twitter user
 */
export default class User<C extends ClientUnionType> extends SimplifiedUser<C> {
  /**
   * The tweet pinned by this user
   */
  pinnedTweet: SimplifiedTweet<C> | null;

  constructor(client: ClientInUse<C>, data: GetSingleUserByIdResponse) {
    super(client, data.data);

    this.pinnedTweet = this.#patchPinnedTweet(data.includes?.tweets) ?? null;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  #patchPinnedTweet(tweets?: Array<APITweet>): SimplifiedTweet<C> | undefined {
    if (!tweets) return;
    const rawPinnedTweet = tweets.find(tweet => tweet.id === this.pinnedTweetID);
    if (!rawPinnedTweet) return;
    return new SimplifiedTweet(this.client, rawPinnedTweet);
  }
}
