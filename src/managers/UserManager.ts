import { User } from '../structures/User.js';
import { BaseManager } from './BaseManager.js';
import { Collection } from '../util/Collection.js';
import { TweetsBook } from '../structures/books/TweetsBook.js';
import { SimplifiedUser } from '../structures/SimplifiedUser.js';
import { MentionsBook } from '../structures/books/MentionsBook.js';
import { FollowersBook } from '../structures/books/FollowersBook.js';
import { FollowingsBook } from '../structures/books/FollowingsBook.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import { LikedTweetsBook } from '../structures/books/LikedTweetsBook.js';
import {
  RequestData,
  UserBlockResponse,
  UserFollowResponse,
  UserMuteResponse,
  UserUnblockResponse,
  UserUnfollowResponse,
  UserUnmuteResponse,
} from '../structures/misc/Misc.js';
import type { Client } from '../client/Client.js';
import type { UserManagerFetchByUsernameResult, UserManagerFetchResult, UserResolvable } from '../typings/Types.js';
import type {
  FetchUserByUsernameOptions,
  FetchUserOptions,
  FetchUsersByUsernamesOptions,
  FetchUsersOptions,
} from '../typings/Interfaces.js';
import type {
  DeleteUsersBlockingResponse,
  DeleteUsersFollowingResponse,
  DeleteUsersMutingResponse,
  GetMultipleUsersByIdsQuery,
  GetMultipleUsersByIdsResponse,
  GetMultipleUsersByUsernamesQuery,
  GetMultipleUsersByUsernamesResponse,
  GetSingleUserByIdQuery,
  GetSingleUserByIdResponse,
  GetSingleUserByUsernameQuery,
  GetSingleUserByUsernameResponse,
  PostUsersBlockingJSONBody,
  PostUsersBlockingResponse,
  PostUsersFollowingJSONBody,
  PostUsersFollowingResponse,
  PostUsersMutingJSONBody,
  PostUsersMutingResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link User} objects and stores their cache
 */
export class UserManager extends BaseManager<Snowflake, UserResolvable, User> {
  /**
   * @param client The client this manager belongs to
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
    return null;
  }

  /**
   * Resolves a user resolvable to its respective id.
   * @param userResolvable An ID or instance that can be resolved to a user object
   * @returns The id of the resolved user object
   */
  override resolveID(userResolvable: UserResolvable): Snowflake | null {
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
  async fetch<T extends FetchUserOptions | FetchUsersOptions>(options: T): Promise<UserManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'object', true);
    if ('user' in options) {
      const userID = this.resolveID(options.user);
      if (!userID) throw new CustomError('USER_RESOLVE_ID', 'fetch');
      return this.#fetchSingleUser(userID, options) as Promise<UserManagerFetchResult<T>>;
    }
    if ('users' in options) {
      if (!Array.isArray(options.users)) throw new CustomTypeError('INVALID_TYPE', 'users', 'array', true);
      const userIDs = options.users.map(user => {
        const userID = this.resolveID(user);
        if (!userID) throw new CustomError('USER_RESOLVE_ID', 'fetch');
        return userID;
      });
      return this.#fetchMultipleUsers(userIDs, options) as Promise<UserManagerFetchResult<T>>;
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
      const { username } = options;
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
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'follow');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUsersFollowingJSONBody = {
      target_user_id: targetUserID,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PostUsersFollowingResponse = await this.client._api.users(loggedInUser.id).following.post(requestData);
    return new UserFollowResponse(data);
  }

  /**
   * Unfollows a user on twitter.
   * @param targetUser The user to unfollow
   * @returns A {@link UserUnfollowResponse} object
   */
  async unfollow(targetUser: UserResolvable): Promise<UserUnfollowResponse> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'unfollow');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DeleteUsersFollowingResponse = await this.client._api
      .users(loggedInUser.id)
      .following(targetUserID)
      .delete(requestData);
    return new UserUnfollowResponse(data);
  }

  /**
   * Blocks a user on twitter.
   * @param targetUser The user to block
   * @returns A {@link UserBlockResponse} object
   */
  async block(targetUser: UserResolvable): Promise<UserBlockResponse> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'block');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUsersBlockingJSONBody = {
      target_user_id: targetUserID,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PostUsersBlockingResponse = await this.client._api.users(loggedInUser.id).blocking.post(requestData);
    return new UserBlockResponse(data);
  }

  /**
   * Unblocks a user on twitter.
   * @param targetUser The user to unblock
   * @returns A {@link UserUnblockResponse} object
   */
  async unblock(targetUser: UserResolvable): Promise<UserUnblockResponse> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'unblock');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DeleteUsersBlockingResponse = await this.client._api
      .users(loggedInUser.id)
      .blocking(targetUserID)
      .delete(requestData);
    return new UserUnblockResponse(data);
  }

  /**
   * Mutes a user on twitter.
   * @param targetUser The user to mute
   * @returns A {@link UserMuteResponse} object
   */
  async mute(targetUser: UserResolvable): Promise<UserMuteResponse> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'mute');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const body: PostUsersMutingJSONBody = {
      target_user_id: targetUserID,
    };
    const requestData = new RequestData({ body, isUserContext: true });
    const data: PostUsersMutingResponse = await this.client._api.users(loggedInUser.id).muting.post(requestData);
    return new UserMuteResponse(data);
  }

  /**
   * Unmutes a user on twitter.
   * @param targetUser The user to unmute
   * @returns A {@link UserUnmuteResponse} object
   */
  async unmute(targetUser: UserResolvable): Promise<UserUnmuteResponse> {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'unmute');
    const loggedInUser = this.client.me;
    if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
    const requestData = new RequestData({ isUserContext: true });
    const data: DeleteUsersMutingResponse = await this.client._api
      .users(loggedInUser.id)
      .muting(targetUserID)
      .delete(requestData);
    return new UserUnmuteResponse(data);
  }

  /**
   * Creates a {@link FollowersBook} object for fetching followers of a user.
   * @param targetUser The user whose followers are to be fetched
   * @param maxResultsPerPage The maximum amount of users to fetch per page. The API will default this to `100` if not provided
   * @returns A {@link FollowersBook} object
   */
  createFollowersBook(targetUser: UserResolvable, maxResultsPerPage?: number): FollowersBook {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'create followers book for');
    const followersBook = new FollowersBook(this.client, targetUserID, maxResultsPerPage);
    return followersBook;
  }

  /**
   * Creates a {@link FollowingsBook} object for fetching users followed by a user.
   * @param targetUser The user whose following users are to be fetched
   * @param maxResultsPerPage The maximum amount of users to fetch per page. The API will default this to `100` if not provided
   * @returns A {@link FollowingsBook} object
   */
  createFollowingBook(targetUser: UserResolvable, maxResultsPerPage?: number): FollowingsBook {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'create following book for');
    const followingBook = new FollowingsBook(this.client, targetUserID, maxResultsPerPage);
    return followingBook;
  }

  /**
   * Creates a {@link LikedTweetsBook} object for fetching liked tweet of a user.
   * @param targetUser The user whose liked tweet are to be fetched
   * @param maxResultsPerPage The maximum amount of tweets to fetch per page
   * @returns A {@link LikedTweetsBook} object
   */
  createLikedTweetsBook(targetUser: UserResolvable, maxResultsPerPage?: number): LikedTweetsBook {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'create liked book for');
    const likedTweetBook = new LikedTweetsBook(this.client, targetUserID, maxResultsPerPage);
    return likedTweetBook;
  }

  /**
   * Creates a {@link TweetsBook} object for fetching tweets composed by a user.
   * @param targetUser The user whose tweets are to be fetched
   * @param maxResultsPerPage The maximum amount of tweets to fetch per page
   * @returns A {@link TweetsBook} object
   */
  createTweetsBook(targetUser: UserResolvable, maxResultsPerPage?: number): TweetsBook {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'create tweets book for');
    const tweetsBook = new TweetsBook(this.client, targetUserID, maxResultsPerPage);
    return tweetsBook;
  }

  /**
   * Creates a {@link MentionsBook} object for fetching tweets mentioning a user.
   * @param targetUser The mentioned user in the tweets
   * @param maxResultsPerPage The maximum amount of tweets to fetch per page
   * @returns A {@link MentionsBook} object
   */
  createMentionsBook(targetUser: UserResolvable, maxResultsPerPage?: number): MentionsBook {
    const targetUserID = this.resolveID(targetUser);
    if (!targetUserID) throw new CustomError('USER_RESOLVE_ID', 'create mentions book for');
    const mentionsBook = new MentionsBook(this.client, targetUserID, maxResultsPerPage);
    return mentionsBook;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  async #fetchSingleUser(userID: Snowflake, options: FetchUserOptions): Promise<User> {
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
    const requestData = new RequestData({ query });
    const data: GetSingleUserByIdResponse = await this.client._api.users(userID).get(requestData);
    return new User(this.client, data);
  }

  async #fetchMultipleUsers(userIDs: Array<Snowflake>, options: FetchUsersOptions): Promise<Collection<string, User>> {
    const fetchedUserCollection = new Collection<string, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleUsersByIdsQuery = {
      ids: userIDs,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetMultipleUsersByIdsResponse = await this.client._api.users.get(requestData);
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
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
    const query: GetSingleUserByUsernameQuery = {
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
    const data: GetSingleUserByUsernameResponse = await this.client._api.users.by.username(username).get(requestData);
    return new User(this.client, data);
  }

  async #fetchMultipleUsersByUsernames(
    usernames: Array<string>,
    options: FetchUsersByUsernamesOptions,
  ): Promise<Collection<string, User>> {
    const fetchedUserCollection = new Collection<string, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleUsersByUsernamesQuery = {
      usernames,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData({ query });
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
