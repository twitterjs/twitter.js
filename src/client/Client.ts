import { BaseClient } from './BaseClient';
import { RESTManager } from '../rest/RESTManager';
import { ClientEvents, Collection, StreamType } from '../util';
import { CustomError, CustomTypeError } from '../errors';
import { UserManager, TweetManager, SpaceManager, ListManager, FilteredStreamRuleManager } from '../managers';
import { ClientCredentials, RequestData, ClientUser, MatchingRule } from '../structures';
import type { Response } from 'undici';
import type { ClientCredentialsInterface, ClientOptions } from '../typings';
import type {
  GetFilteredTweetStreamQuery,
  GetFilteredTweetStreamResponse,
  GetSampledTweetStreamQuery,
  GetSampledTweetStreamResponse,
  GetSingleUserByUsernameQuery,
  GetSingleUserByUsernameResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The core class that exposes all the functionalities available in twitter.js
 */
export class Client extends BaseClient {
  /**
   * The time at which the client became `ready`
   */
  readyAt: Date | null;

  /**
   * The bearer token that was provided to the client during login
   */
  token: string | null;

  /**
   * The credentials that were provided to the client during login
   *
   * **Note**: This will be available only if the client was logged in using {@link Client.login}
   */
  credentials: ClientCredentials | null;

  /**
   * The twitter user this client represents
   *
   * **Note**: This will be available only if the client was logged in using {@link Client.login}
   */
  me: ClientUser | null;

  /**
   * The manager for twitter API requests made by the client
   */
  rest: RESTManager;

  /**
   * The manager for {@link Tweet} objects
   */
  tweets: TweetManager;

  /**
   * The manager for {@link User} objects
   */
  users: UserManager;

  /**
   * The manager for {@link Space} objects
   */
  spaces: SpaceManager;

  /**
   * The manager for {@link List} objects
   */
  lists: ListManager;

  /**
   * The manager for {@link FilteredStreamRule} objects
   */
  filteredStreamRules: FilteredStreamRuleManager;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options?: ClientOptions) {
    super(options);

    Object.defineProperty(this, 'token', { writable: true, enumerable: false });
    this.token = null;

    Object.defineProperty(this, 'credentials', { writable: true, enumerable: false });
    this.credentials = null;

    this.me = null;
    this.readyAt = null;
    this.rest = new RESTManager(this);
    this.tweets = new TweetManager(this);
    this.users = new UserManager(this);
    this.spaces = new SpaceManager(this);
    this.lists = new ListManager(this);
    this.filteredStreamRules = new FilteredStreamRuleManager(this);
  }

  /**
   * A getter that returns the `routeBuilder` method of {@link RESTManager}
   * for making API requests
   *
   * **Note**: This is a shortcut made available for internal use only, users of the library need not to
   * use it and should treat it as a private field
   * @private
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get _api(): any {
    return this.rest.routeBuilder;
  }

  /**
   * Sets the client ready to make bearer token authorized API requests.
   * Emits a `ready` event on success.
   * @param token The bearer token for the client
   * @returns The provided bearer token as a `Promise`
   *
   * @throws {@link CustomTypeError} The exception is thrown if the `token` param is not a string
   */
  async loginWithBearerToken(token: string): Promise<string> {
    if (typeof token !== 'string') {
      throw new CustomTypeError('INVALID_TYPE', 'token', 'string', false);
    }
    this.token = token;
    this.readyAt = new Date();

    this.emit(ClientEvents.READY, this);
    if (this.options.events.includes('FILTERED_TWEET_CREATE')) {
      this.#connectToFilteredStream();
    }
    if (this.options.events.includes('SAMPLED_TWEET_CREATE')) {
      this.#connectToSampledStream();
    }
    return this.token;
  }

  /**
   * Sets the client ready to make both bearer token and user context authorized API requests.
   * Emits a `ready` event on success.
   * @param credentials The credentials for the client
   * @returns The provided credentials as a `Promise`
   *
   * @throws {@link CustomTypeError} The exception is thrown if the `credentials` param is not an object
   */
  async login(credentials: ClientCredentialsInterface): Promise<ClientCredentials> {
    if (typeof credentials !== 'object') {
      throw new CustomTypeError('INVALID_TYPE', 'credentials', 'object', true);
    }
    this.credentials = new ClientCredentials(credentials);
    this.token = this.credentials.bearerToken;
    this.readyAt = new Date();

    this.me = await this.#fetchClientUser(credentials.username);

    if (this.me?.username !== this.credentials.username)
      throw new CustomError('USER_CONTEXT_LOGIN_ERROR', this.credentials.username);

    this.emit(ClientEvents.READY, this);
    if (this.options.events.includes('FILTERED_TWEET_CREATE')) {
      this.#connectToFilteredStream();
    }
    if (this.options.events.includes('SAMPLED_TWEET_CREATE')) {
      this.#connectToSampledStream();
    }
    return this.credentials;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchClientUser(username: string): Promise<ClientUser> {
    const queryParameters = this.options.queryParameters;
    const query: GetSingleUserByUsernameQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetSingleUserByUsernameResponse = await this._api.users.by.username(username).get(requestData);
    return new ClientUser(this, data);
  }

  async #connectToFilteredStream(): Promise<void> {
    const queryParameters = this.options.queryParameters;
    const query: GetFilteredTweetStreamQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query, isStreaming: true });
    const { body }: Response = await this._api.tweets.search.stream.get(requestData);
    if (!body) throw Error('No response body');
    try {
      for await (const chunk of body) {
        const buffer = Buffer.from(chunk);
        const data = buffer.toString();
        if (data === '\r\n') {
          if (this.options.events.includes('KEEP_ALIVE_SIGNAL')) {
            this.emit(ClientEvents.KEEP_ALIVE_SIGNAL, StreamType.FILTERED);
          }
          continue;
        }
        try {
          const rawData: GetFilteredTweetStreamResponse = JSON.parse(data);
          const tweet = this.tweets._add(rawData.data.id, rawData, false);
          const matchingRules = rawData.matching_rules.reduce((col, rule) => {
            col.set(rule.id, new MatchingRule(rule));
            return col;
          }, new Collection<Snowflake, MatchingRule>());
          this.emit(ClientEvents.FILTERED_TWEET_CREATE, tweet, matchingRules);
        } catch (error) {
          // twitter sends corrupted data sometimes that throws error while parsing it
        }
      }
    } catch (error) {
      console.log(error);
      // TODO: add a reconnection mechanism
    }
  }

  async #connectToSampledStream(): Promise<void> {
    const queryParameters = this.options.queryParameters;
    const query: GetSampledTweetStreamQuery = {
      expansions: queryParameters?.tweetExpansions,
      'media.fields': queryParameters?.mediaFields,
      'place.fields': queryParameters?.placeFields,
      'poll.fields': queryParameters?.pollFields,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query, isStreaming: true });
    const { body }: Response = await this._api.tweets.sample.stream.get(requestData);
    if (!body) throw Error('No response body');
    try {
      for await (const chunk of body) {
        const buffer = Buffer.from(chunk);
        const data = buffer.toString();
        if (data === '\r\n') {
          if (this.options.events.includes('KEEP_ALIVE_SIGNAL')) {
            this.emit(ClientEvents.KEEP_ALIVE_SIGNAL, StreamType.SAMPLED);
          }
          continue;
        }
        try {
          const rawTweet: GetSampledTweetStreamResponse = JSON.parse(data);
          const tweet = this.tweets._add(rawTweet.data.id, rawTweet, false);
          this.emit(ClientEvents.SAMPLED_TWEET_CREATE, tweet);
        } catch (error) {
          // twitter sends corrupted data sometimes that throws error while parsing it
        }
      }
    } catch (error) {
      console.log(error);
      // TODO: add a reconnection mechanism
    }
  }
}
