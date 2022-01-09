import { Collection } from '../util';
import { BaseBook } from './BaseBook';
import { CustomError } from '../errors';
import { RequestData, type Tweet } from '../structures';
import type { Client } from '../client';
import type { ListTweetsBookOptions } from '../typings';
import type { GETListsIdTweetsQuery, GETListsIdtweetsResponse, Snowflake } from 'twitter-types';

/**
 * A class for fetching tweets from a list
 */
export class ListTweetsBook extends BaseBook {
  /**
   * The Id of the list this book belongs to
   */
  listId: Snowflake;

  /**
   * @param client The logged in {@link Client} instance
   * @param options The options to initialize the list tweets book with
   */
  constructor(client: Client, options: ListTweetsBookOptions) {
    super(client, options);
    const listId = client.lists.resolveId(options.list);
    if (!listId) throw new CustomError('LIST_RESOLVE_ID', 'create ListTweetsBook for');
    this.listId = listId;
  }

  /**
   * Fetches the next page of the book if there is one.
   * @returns A {@link Collection} of {@link Tweet} objects belonging to the given list
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
   * @returns A {@link Collection} of {@link Tweet} objects belonging to the given list
   */
  async fetchPreviousPage(): Promise<Collection<Snowflake, Tweet>> {
    if (!this._previousToken) throw new CustomError('PAGINATED_RESPONSE_HEAD_REACHED');
    return this.#fetchPages(this._previousToken);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchPages(token?: string): Promise<Collection<Snowflake, Tweet>> {
    const listTweets = new Collection<Snowflake, Tweet>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETListsIdTweetsQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
      pagination_token: token,
    };
    if (this.maxResultsPerPage) query.max_results = this.maxResultsPerPage;
    const requestData = new RequestData({ query });
    const data: GETListsIdtweetsResponse = await this.client._api.lists(this.listId).tweets.get(requestData);
    this._nextToken = data.meta.next_token;
    this._previousToken = data.meta.previous_token;
    this.hasMore = data.meta.next_token ? true : false;
    if (data.meta.result_count === 0) return listTweets;
    const rawTweets = data.data;
    const rawIncludes = data.includes;
    for (const rawTweet of rawTweets) {
      const tweet = this.client.tweets._add(rawTweet.id, { data: rawTweet, includes: rawIncludes });
      listTweets.set(tweet.id, tweet);
    }
    return listTweets;
  }
}
