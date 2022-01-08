import { Collection } from '../util';
import { CustomError } from '../errors';
import { RequestData } from '../structures';
import { BaseRangeBook } from './BaseRangeBook';
import type { Client } from '../client';
import type { Tweet } from '../structures';
import type { MentionsBookOptions } from '../typings';
import type { GETUsersIdMentionsQuery, GETUsersIdMentionsResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching tweets that mention a twitter user
 */
export class MentionsBook extends BaseRangeBook {
  /**
   * The ID of the user this book belongs to
   */
  userId: Snowflake;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the mentions book with
   */
  constructor(client: Client, options: MentionsBookOptions) {
    super(client, options);
    const userId = client.users.resolveId(options.user);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'create LikedTweetsBook for');
    this.userId = userId;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link Tweets} mentioning the owner of this book
   */
  async fetchNextPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this._hasMadeInitialRequest) {
      this._hasMadeInitialRequest = true;
      return this.#fetchPages();
    }
    if (!this._nextToken) throw new CustomError('PAGINATED_RESPONSE_TAIL_REACHED');
    return this.#fetchPages(this._nextToken);
  }

  /**
   * Fetches the previous page of the book if there is one.
   * @returns A {@link Collection} of {@link Tweets} mentioning the owner of this book
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this._previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, Tweet>> {
    const mentioningTweetsCollection = new Collection<Snowflake, Tweet>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETUsersIdMentionsQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
    };
    if (this.afterTweetId) query.since_id = this.afterTweetId;
    if (this.beforeTweetId) query.until_id = this.beforeTweetId;
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    if (this.startTimestamp) query.start_time = new Date(this.startTimestamp).toISOString();
    if (this.endTimestamp) query.end_time = new Date(this.endTimestamp).toISOString();
    const requestData = new RequestData({ query });
    const data: GETUsersIdMentionsResponse = await this.client._api.users(this.userId).mentions.get(requestData);
    this._nextToken = data.meta.next_token;
    this._previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    if (data.meta.result_count === 0) return mentioningTweetsCollection;
    const rawTweets = data.data;
    const rawIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = this.client.tweets._add(rawTweet.id, { data: rawTweet, includes: rawIncludes });
      mentioningTweetsCollection.set(tweet.id, tweet);
    }
    return mentioningTweetsCollection;
  }
}
