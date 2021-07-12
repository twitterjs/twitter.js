import User from '../structures/User.js';
import BaseManager from './BaseManager.js';
import Collection from '../util/Collection.js';
import FollowersBook from '../structures/FollowersBook.js';
import FollowingBook from '../structures/FollowingBook.js';
import SimplifiedUser from '../structures/SimplifiedUser.js';
import UserContextClient from '../client/UserContextClient.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import {
  RequestData,
  UserBlockResponse,
  UserFollowResponse,
  UserMuteResponse,
  UserUnblockResponse,
  UserUnfollowResponse,
  UserUnmuteResponse,
} from '../structures/misc/Misc.js';
import type {
  ClientInUse,
  ClientUnionType,
  UserManagerFetchByUsernameResult,
  UserManagerFetchResult,
  UserResolvable,
} from '../typings/Types.js';
import type {
  FetchUserByUsernameOptions,
  FetchUserOptions,
  FetchUsersByUsernamesOptions,
  FetchUsersOptions,
} from '../typings/Interfaces.js';
import type {
  DeleteUserUnblockResponse,
  DeleteUserUnfollowResponse,
  GetMultipleUsersByIdsQuery,
  GetMultipleUsersByIdsResponse,
  GetMultipleUsersByUsernamesQuery,
  GetMultipleUsersByUsernamesResponse,
  GetSingleUserByIdQuery,
  GetSingleUserByIdResponse,
  GetSingleUserByUsernameQuery,
  GetSingleUserByUsernameResponse,
  PostUserBlockJSONBody,
  PostUserBlockResponse,
  PostUserFollowJSONBody,
  PostUserFollowResponse,
  PostUserMuteJSONBody,
  PostUserMuteResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link User} objects and stores their cache
 */
export default class UserManager<C extends ClientUnionType> extends BaseManager<
  Snowflake,
  UserResolvable<C>,
  User<C>,
  C
> {
  /**
   * @param client The client this manager belongs to
   */
  constructor(client: ClientInUse<C>) {
    super(client, User);
  }

  /**
   * Resolves a user resolvable to its respective {@link User} object.
   * @param userResolvable An ID or instance that can be resolved to a user object
   * @returns The resolved user object
   */
  override resolve(userResolvable: UserResolvable<C>): User<C> | null {
    const user = super.resolve(userResolvable);
    if (user) return user;
    if (userResolvable instanceof SimplifiedUser) return super.resolve(userResolvable.id);
    return null;
  }

  /**
   * Resolves a user resolvable to its respective id.
   * @param userResolvable An ID or instance that can be resolved to a user object
   * @returns The id of the resolved user object
   */
  override resolveID(userResolvable: UserResolvable<C>): Snowflake | null {
    const userID = super.resolveID(userResolvable);
    if (typeof userID === 'string') return userID;
    if (userResolvable instanceof SimplifiedUser) return userResolvable.id;
    return null;
  }

  /**
   * Fetches users from Twitter.
   * @param options The options for fetching users
   * @returns A {@link User} or a {@link Collection} of them as a `Promise`
   */
  async fetch<T extends FetchUserOptions<C> | FetchUsersOptions<C>>(options: T): Promise<UserManagerFetchResult<T, C>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('user' in options) {
      const userID = this.resolveID(options.user);
      if (!userID) throw new CustomError('USER_RESOLVE_ID', 'fetch');
      return this.#fetchSingleUser(userID, options) as Promise<UserManagerFetchResult<T, C>>;
    }
    if ('users' in options) {
      if (!Array.isArray(options.users)) throw new CustomTypeError('INVALID_TYPE', 'users', 'array', true);
      const userIDs = options.users.map(user => {
        const userID = this.resolveID(user);
        if (!userID) throw new CustomError('USER_RESOLVE_ID', 'fetch');
        return userID;
      });
      return this.#fetchMultipleUsers(userIDs, options) as Promise<UserManagerFetchResult<T, C>>;
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
  ): Promise<UserManagerFetchByUsernameResult<T, C>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('username' in options) {
      const { username } = options;
      if (typeof username !== 'string') throw new CustomTypeError('INVALID_TYPE', 'username', 'string', false);
      return this.#fetchSingleUserByUsername(username, options) as Promise<UserManagerFetchByUsernameResult<T, C>>;
    }
    if ('usernames' in options) {
      if (!Array.isArray(options.usernames)) throw new CustomTypeError('INVALID_TYPE', 'usernames', 'array', true);
      const usernames = options.usernames.map(username => {
        if (typeof username !== 'string')
          throw new CustomTypeError('INVALID_TYPE', 'username in the usernames array', 'string', false);
        return username;
      });
      return this.#fetchMultipleUsersByUsernames(usernames, options) as Promise<UserManagerFetchByUsernameResult<T, C>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  /**
   * Follows a user on twitter.
   * @param targetUser The user to follow
   * @returns A {@link UserFollowResponse} object
   */
  async follow(targetUser: UserResolvable<C>): Promise<UserFollowResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'follow');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUserFollowJSONBody = {
      target_user_id: targetUserID,
    };
    const requestData = new RequestData(null, body);
    const data: PostUserFollowResponse = await this.client._api.users(loggedInUser.id).following.post(requestData);
    return new UserFollowResponse(data);
  }

  /**
   * Unfollows a user on twitter.
   * @param targetUser The user to unfollow
   * @returns A {@link UserUnfollowResponse} object
   */
  async unfollow(targetUser: UserResolvable<C>): Promise<UserUnfollowResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'unfollow');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const data: DeleteUserUnfollowResponse = await this.client._api
      .users(loggedInUser.id)
      .following(targetUserID)
      .delete();
    return new UserUnfollowResponse(data);
  }

  /**
   * Blocks a user on twitter.
   * @param targetUser The user to block
   * @returns A {@link UserBlockResponse} object
   */
  async block(targetUser: UserResolvable<C>): Promise<UserBlockResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'block');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUserBlockJSONBody = {
      target_user_id: targetUserID,
    };
    const requestData = new RequestData(null, body);
    const data: PostUserBlockResponse = await this.client._api.users(loggedInUser.id).blocking.post(requestData);
    return new UserBlockResponse(data);
  }

  /**
   * Unblocks a user on twitter.
   * @param targetUser The user to unblock
   * @returns A {@link UserUnblockResponse} object
   */
  async unblock(targetUser: UserResolvable<C>): Promise<UserUnblockResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'unblock');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const data: DeleteUserUnblockResponse = await this.client._api
      .users(loggedInUser.id)
      .blocking(targetUserID)
      .delete();
    return new UserUnblockResponse(data);
  }

  /**
   * Mutes a user on twitter.
   * @param targetUser The user to mute
   * @returns A {@link UserMuteResponse} object
   */
  async mute(targetUser: UserResolvable<C>): Promise<UserMuteResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'mute');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUserMuteJSONBody = {
      target_user_id: targetUserID,
    };
    const requestData = new RequestData(null, body);
    const data: PostUserMuteResponse = await this.client._api.users(loggedInUser.id).muting.post(requestData);
    return new UserMuteResponse(data);
  }

  /**
   * Unmutes a user on twitter.
   * @param targetUser The user to unmute
   * @returns A {@link UserUnmuteResponse} object
   */
  async unmute(targetUser: UserResolvable<C>): Promise<UserUnmuteResponse> {
    if (!(this.client instanceof UserContextClient)) throw new CustomError('NOT_USER_CONTEXT_CLIENT');
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'unmute');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const data: PostUserMuteResponse = await this.client._api.users(loggedInUser.id).muting(targetUserID).delete();
    return new UserUnmuteResponse(data);
  }

  /**
   * Fetches a {@link FollowersBook} object belonging to a user.
   * @param targetUser The user whose followers book is to be fetched
   * @param maxResultsPerPage The maximum amount of followers to fetch per page. The API will default this to `100` if not provided
   * @returns A {@link FollowersBook} object as a `Promise`
   */
  async fetchFollowersBook(targetUser: UserResolvable<C>, maxResultsPerPage?: number): Promise<FollowersBook<C>> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'fetch followers of');
    const followersBook = new FollowersBook(this.client, targetUserID, maxResultsPerPage);
    await followersBook._init();
    return followersBook;
  }

  /**
   * Fetches a {@link FollowingBook} object belonging to a user.
   * @param targetUser The user whose following book is to be fetched
   * @param maxResultsPerPage The maximum amount of users to fetch per page. The API will default this to `100` if not provided
   * @returns A {@link FollowingBook} object as a `Promise`
   */
  async fetchFollowingBook(targetUser: UserResolvable<C>, maxResultsPerPage?: number): Promise<FollowingBook<C>> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'fetch followers of');
    const followingBook = new FollowingBook(this.client, targetUserID, maxResultsPerPage);
    await followingBook._init();
    return followingBook;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleUser(userID: Snowflake, options: FetchUserOptions<C>): Promise<User<C>> {
    if (!options.skipCacheCheck) {
      const cachedUser = this.cache.get(userID);
      if (cachedUser) return cachedUser;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GetSingleUserByIdQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetSingleUserByIdResponse = await this.client._api.users(userID).get(requestData);
    return new User(this.client, data);
  }

  async #fetchMultipleUsers(
    userIDs: Array<Snowflake>,
    options: FetchUsersOptions<C>,
  ): Promise<Collection<string, User<C>>> {
    const fetchedUserCollection = new Collection<string, User<C>>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleUsersByIdsQuery = {
      ids: userIDs,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetMultipleUsersByIdsResponse = await this.client._api.users.get(requestData);
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
      fetchedUserCollection.set(user.id, user);
    }
    return fetchedUserCollection;
  }

  async #fetchSingleUserByUsername(username: string, options: FetchUserByUsernameOptions): Promise<User<C>> {
    if (!options.skipCacheCheck) {
      const cachedUser = this.cache.find(user => user.username === username);
      if (cachedUser) return cachedUser;
    }
    const queryParameters = this.client.options.queryParameters;
    const query: GetSingleUserByUsernameQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetSingleUserByUsernameResponse = await this.client._api.users.by.username(username).get(requestData);
    return new User(this.client, data);
  }

  async #fetchMultipleUsersByUsernames(
    usernames: Array<string>,
    options: FetchUsersByUsernamesOptions,
  ): Promise<Collection<string, User<C>>> {
    const fetchedUserCollection = new Collection<string, User<C>>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleUsersByUsernamesQuery = {
      usernames,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null);
    const data: GetMultipleUsersByUsernamesResponse = await this.client._api.users.by.get(requestData);
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
      fetchedUserCollection.set(user.id, user);
    }
    return fetchedUserCollection;
  }
}
