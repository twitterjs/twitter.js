import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import {
  RequestData,
  UserBlockResponse,
  UserFollowResponse,
  UserMuteResponse,
  UserUnblockResponse,
  UserUnfollowResponse,
  UserUnmuteResponse,
  User,
  Tweet,
  SimplifiedUser,
  SimplifiedTweet,
} from '../structures';
import type { Client } from '../client';
import type {
  UserManagerFetchByUsernameResult,
  UserManagerFetchResult,
  UserResolvable,
  FetchUserByUsernameOptions,
  FetchUserOptions,
  FetchUsersByUsernamesOptions,
  FetchUsersOptions,
} from '../typings';
import type {
  DELETEUsersSourceUserIdBlockingTargetUserIdResponse,
  DELETEUsersSourceUserIdFollowingTargetUserIdResponse,
  DELETEUsersSourceUserIdMutingTargetUserIdResponse,
  GETUsersByQuery,
  GETUsersByResponse,
  GETUsersByUsernameUsernameQuery,
  GETUsersByUsernameUsernameResponse,
  GETUsersIdQuery,
  GETUsersIdResponse,
  GETUsersQuery,
  GETUsersResponse,
  POSTUsersIdBlockingJSONBody,
  POSTUsersIdBlockingResponse,
  POSTUsersIdFollowingJSONBody,
  POSTUsersIdFollowingResponse,
  POSTUsersIdMutingJSONBody,
  POSTUsersIdMutingResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link User} objects and stores their cache
 */
export class UserManager extends BaseManager<Snowflake, UserResolvable, User> {
  /**
   * @param client The logged in {@link Client} instance
   */
  constructor(client: Client) {
    super(client, User);
  }

  /**
   * Resolves a user resolvable to its respective {@link User} object.
   * @param userResolvable An ID or instance that can be resolved to a user object
   * @returns The resolved user object
   */
  override resolve(userResolvable: UserResolvable): User | null {
    const user = super.resolve(userResolvable);
    if (user) return user;
    if (userResolvable instanceof SimplifiedUser) return super.resolve(userResolvable.id);
    if (userResolvable instanceof Tweet || userResolvable instanceof SimplifiedTweet) {
      return userResolvable.authorId ? super.resolve(userResolvable.authorId) : null;
    }
    return null;
  }

  /**
   * Resolves a user resolvable to its respective id.
   * @param userResolvable An ID or instance that can be resolved to a user object
   * @returns The id of the resolved user object
   */
  override resolveId(userResolvable: UserResolvable): Snowflake | null {
    const userId = super.resolveId(userResolvable);
    if (typeof userId === 'string') return userId;
    if (userResolvable instanceof SimplifiedUser) return userResolvable.id;
    if (userResolvable instanceof Tweet || userResolvable instanceof SimplifiedTweet) return userResolvable.authorId;
    return null;
  }

  /**
   * Fetches users from Twitter.
   * @param options The options for fetching users
   * @returns A {@link User} or a {@link Collection} of them as a `Promise`
   */
  async fetch<T extends FetchUserOptions | FetchUsersOptions>(options: T): Promise<UserManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('user' in options) {
      const userId = this.resolveId(options.user);
      if (!userId) throw new CustomError('USER_RESOLVE_ID', 'fetch');
      return this.#fetchSingleUser(userId, options) as Promise<UserManagerFetchResult<T>>;
    }
    if ('users' in options) {
      if (!Array.isArray(options.users)) throw new CustomTypeError('INVALID_TYPE', 'users', 'array', true);
      const userIds = options.users.map(user => {
        const userId = this.resolveId(user);
        if (!userId) throw new CustomError('USER_RESOLVE_ID', 'fetch');
        return userId;
      });
      return this.#fetchMultipleUsers(userIds, options) as Promise<UserManagerFetchResult<T>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Fetches users from Twitter using their usernames.
   *
   * **⚠ Use {@link UserManager.fetch} if you have IDs, because usernames are subject to change**
   * @param options The options for fetching users
   * @returns A {@link User} or a {@link Collection} of them as a `Promise`
   */
  async fetchByUsername<T extends FetchUserByUsernameOptions | FetchUsersByUsernamesOptions>(
    options: T,
  ): Promise<UserManagerFetchByUsernameResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('username' in options) {
      const username = options.username;
      if (typeof username !== 'string') throw new CustomTypeError('INVALID_TYPE', 'username', 'string', false);
      return this.#fetchSingleUserByUsername(username, options) as Promise<UserManagerFetchByUsernameResult<T>>;
    }
    if ('usernames' in options) {
      if (!Array.isArray(options.usernames)) throw new CustomTypeError('INVALID_TYPE', 'usernames', 'array', true);
      const usernames = options.usernames.map(username => {
        if (typeof username !== 'string')
          throw new CustomTypeError('INVALID_TYPE', 'username in the usernames array', 'string', false);
        return username;
      });
      return this.#fetchMultipleUsersByUsernames(usernames, options) as Promise<UserManagerFetchByUsernameResult<T>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Follows a user on twitter.
   * @param targetUser The user to follow
   * @returns A {@link UserFollowResponse} object
   */
  async follow(targetUser: UserResolvable): Promise<UserFollowResponse> {
    const userId = this.resolveId(targetUser);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'follow');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: POSTUsersIdFollowingJSONBody = {
      target_user_id: userId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: POSTUsersIdFollowingResponse = await this.client._api
      .users(loggedInUser.id)
      .following.post(requestData);
    return new UserFollowResponse(data);
  }

  /**
   * Unfollows a user on twitter.
   * @param targetUser The user to unfollow
   * @returns A {@link UserUnfollowResponse} object
   */
  async unfollow(targetUser: UserResolvable): Promise<UserUnfollowResponse> {
    const userId = this.resolveId(targetUser);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'unfollow');
    const loggedInUserId = this.client.me?.id;
    if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DELETEUsersSourceUserIdFollowingTargetUserIdResponse = await this.client._api
      .users(loggedInUserId)
      .following(userId)
      .delete(requestData);
    return new UserUnfollowResponse(data);
  }

  /**
   * Blocks a user on twitter.
   * @param targetUser The user to block
   * @returns A {@link UserBlockResponse} object
   */
  async block(targetUser: UserResolvable): Promise<UserBlockResponse> {
    const userId = this.resolveId(targetUser);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'block');
    const loggedInUserId = this.client.me?.id;
    if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
    const body: POSTUsersIdBlockingJSONBody = {
      target_user_id: userId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: POSTUsersIdBlockingResponse = await this.client._api.users(loggedInUserId).blocking.post(requestData);
    return new UserBlockResponse(data);
  }

  /**
   * Unblocks a user on twitter.
   * @param targetUser The user to unblock
   * @returns A {@link UserUnblockResponse} object
   */
  async unblock(targetUser: UserResolvable): Promise<UserUnblockResponse> {
    const userId = this.resolveId(targetUser);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'unblock');
    const loggedInUserId = this.client.me?.id;
    if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DELETEUsersSourceUserIdBlockingTargetUserIdResponse = await this.client._api
      .users(loggedInUserId)
      .blocking(userId)
      .delete(requestData);
    return new UserUnblockResponse(data);
  }

  /**
   * Mutes a user on twitter.
   * @param targetUser The user to mute
   * @returns A {@link UserMuteResponse} object
   */
  async mute(targetUser: UserResolvable): Promise<UserMuteResponse> {
    const userId = this.resolveId(targetUser);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'mute');
    const loggedInUserId = this.client.me?.id;
    if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
    const body: POSTUsersIdMutingJSONBody = {
      target_user_id: userId,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: POSTUsersIdMutingResponse = await this.client._api.users(loggedInUserId).muting.post(requestData);
    return new UserMuteResponse(data);
  }

  /**
   * Unmutes a user on twitter.
   * @param targetUser The user to unmute
   * @returns A {@link UserUnmuteResponse} object
   */
  async unmute(targetUser: UserResolvable): Promise<UserUnmuteResponse> {
    const userId = this.resolveId(targetUser);
    if (!userId) throw new CustomError('USER_RESOLVE_ID', 'unmute');
    const loggedInUserId = this.client.me?.id;
    if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DELETEUsersSourceUserIdMutingTargetUserIdResponse = await this.client._api
      .users(loggedInUserId)
      .muting(userId)
      .delete(requestData);
    return new UserUnmuteResponse(data);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleUser(userId: Snowflake, options: FetchUserOptions): Promise<User> {
    if (!options.skipCacheCheck) {
      const cachedUser = this.cache.get(userId);
      if (cachedUser) return cachedUser;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GETUsersIdQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GETUsersIdResponse = await this.client._api.users(userId).get(requestData);
    return new User(this.client, data);
  }

  async #fetchMultipleUsers(userIds: Array<Snowflake>, options: FetchUsersOptions): Promise<Collection<string, User>> {
    const fetchedUserCollection = new Collection<string, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETUsersQuery = {
      ids: userIds,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GETUsersResponse = await this.client._api.users.get(requestData);
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this._add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
      fetchedUserCollection.set(user.id, user);
    }
    return fetchedUserCollection;
  }

  async #fetchSingleUserByUsername(username: string, options: FetchUserByUsernameOptions): Promise<User> {
    if (!options.skipCacheCheck) {
      const cachedUser = this.cache.find(user => user.username === username);
      if (cachedUser) return cachedUser;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GETUsersByUsernameUsernameQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GETUsersByUsernameUsernameResponse = await this.client._api.users.by
      .username(username)
      .get(requestData);
    return new User(this.client, data);
  }

  async #fetchMultipleUsersByUsernames(
    usernames: Array<string>,
    options: FetchUsersByUsernamesOptions,
  ): Promise<Collection<string, User>> {
    const fetchedUserCollection = new Collection<string, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GETUsersByQuery = {
      usernames,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GETUsersByResponse = await this.client._api.users.by.get(requestData);
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this._add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
      fetchedUserCollection.set(user.id, user);
    }
    return fetchedUserCollection;
  }
}
