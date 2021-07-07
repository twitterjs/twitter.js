import SimplifiedUser from './SimplifiedUser.js';
import SimplifiedTweet from './SimplifiedTweet.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type { APITweetObject, GetSingleUserByIdResponse } from 'twitter-types';

export default class User<C extends ClientUnionType> extends SimplifiedUser<C> {
  /**
   * The tweet pinned by this user
   */
  pinnedTweet: SimplifiedTweet<C> | null;

  constructor(client: ClientInUse<C>, data: GetSingleUserByIdResponse) {
    super(client, data.data);

    this.pinnedTweet = this.#patchPinnedTweet(data.includes?.tweets) ?? null;
  }

  #patchPinnedTweet(tweets?: Array<APITweetObject>): SimplifiedTweet<C> | undefined {
    if (!tweets) return;
    const rawPinnedTweet = tweets.find(tweet => tweet.id === this.pinnedTweetID);
    if (!rawPinnedTweet) return;
    return new SimplifiedTweet(this.client, rawPinnedTweet);
  }
}
