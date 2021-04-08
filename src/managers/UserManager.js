import User from '../structures/User.js';
import BaseManager from './BaseManager.js';
import { queryParameters, queryTypes } from '../util/Constants.js';
import { userBuilder } from '../util/StructureBuilder.js';
import { cleanFetchManyUsersResponse } from '../util/ResponseCleaner.js';
import APIOptions from '../structures/APIOptions.js';
import { FollowRequest, UnfollowRequest, BlockResponse, UnblockResponse } from '../structures/MiscResponses.js';

/**
 * Manages the API methods for users and stores their cache
 * @extends {BaseManager}
 */
class UserManager extends BaseManager {
  /**
   * @param {Client} client The client that instantiated this class
   */
  constructor(client) {
    super(client, User);
  }
  /**
   * The cache of this manager
   * @type {Collection<string, User>}
   * @name UserManager#cache
   */

  /**
   * Data that resolves to a User object. This can be:
   * * A User object
   * * A user ID
   * * A username
   * @typedef {User|string} UserResolvable
   */

  /**
   * Resolves a UserResolvable to a User object
   * @param {UserResolvable} userResolvable The id, username, or instance of a User object
   * @returns {?User}
   */
  resolve(userResolvable) {
    const user = super.resolve(userResolvable);
    if (user) return user;
    const userID = super.resolveID(userResolvable);
    if (userID) return super.resolve(userID);
    if (typeof userResolvable === 'string') return this.cache.find(user => user.username === userResolvable);
    return null;
  }

  /**
   * Resolves a UserResolvable to a user ID
   * @param {UserResolvable} userResolvable The id, username, or instance of a User object
   * @returns {?string}
   */
  resolveID(userResolvable) {
    const userID = super.resolveID(userResolvable);
    if (userID) return userID;
    if (typeof userResolvable === 'string') return this.cache.find(user => user.username === userResolvable)?.id;
    return null;
  }

  /**
   * Options used to fetch a single user
   * @typedef {Object} FetchUserOptions
   * @property {UserResolvable} user The user to fetch
   * @property {boolean} [cache=true] Whether to cache the fetched user or not
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Options used to fetch multiple users
   * @typedef {Object} FetchUsersOptions
   * @property {UserResolvable|UserResolvable[]} user The user(s) to fetch
   * @property {boolean} [skipCacheCheck=false] Whether to skip the cache check and request the API directly
   */

  /**
   * Fetches user(s) from Twitter
   * @param {UserResolvable|FetchUserOptions|FetchUsersOptions} [options] Options to fetch user(s)
   * @returns {Promise<User>|Promise<Collection<string, User>>}
   * @example
   * // Fetch a user using ID
   * client.users.fetch('1234567890')
   * 	.then(console.log)
   * 	.catch(console.error);
   */
  async fetch(options) {
    const userID = this.resolveID(options);
    if (userID) {
      const userData = await this._fetchSingle(userID, queryTypes.ID);
      const user = userBuilder(this.client, userData);
      return user;
    }
    if (typeof options === 'string') {
      const userData = await this._fetchSingle(options, queryTypes.USERNAME);
      const user = userBuilder(this.client, userData);
      return user;
    }
    if (options.user) {
      if (Array.isArray(options.user)) {
        const userIdsArray = [];
        const userNamesArray = [];
        options.user.forEach(userResolvable => {
          const userID = this.resolveID(userResolvable);
          if (userID) {
            userIdsArray.push(userID);
          } else if (typeof userResolvable === 'string') {
            userNamesArray.push(userResolvable);
          }
        });
        const usersResponse = [];
        if (userIdsArray.length) usersResponse.push(await this._fetchMany(userIdsArray, queryTypes.ID));
        if (userNamesArray.length) usersResponse.push(await this._fetchMany(userNamesArray, queryTypes.USERNAME));
        const usersData = cleanFetchManyUsersResponse(usersResponse);
        const usersCollection = userBuilder(this.client, usersData);
        return usersCollection;
      } else {
        const userID = this.resolveID(options.user);
        if (userID) {
          const userData = await this._fetchSingle(options.user, queryTypes.ID);
          const user = userBuilder(this.client, userData);
          return user;
        }
        if (typeof options.user === 'string') {
          const userData = await this._fetchSingle(options.user, queryTypes.USERNAME);
          const user = userBuilder(this.client, userData);
          return user;
        }
      }
    }
  }

  /**
   * Fetches a single user from Twitter
   * @param {string} query Either an ID or the username of the user to fetch
   * @param {string} queryType Specifies whether the query is an id or username
   * @private
   */
  async _fetchSingle(query, queryType) {
    const queryParams = {
      'user.fields': queryParameters.userFields,
      'tweet.fields': queryParameters.tweetFields,
      expansions: queryParameters.expansions.user,
    };
    const options = new APIOptions(queryParams, null, false);
    if (queryType === queryTypes.ID) return await this.client.api.users(query).get(options);
    if (queryType === queryTypes.USERNAME) return await this.client.api.users.by.username(query).get(options);
  }

  /**
   * Fetches users from Twitter
   * @param {Array<string>} query An array of IDs or usernames of the users to fetch
   * @param {string} queryType Specifies whether the query is an array of IDs or usernames
   * @private
   */
  async _fetchMany(query, queryType) {
    const queryParams = {
      'user.fields': queryParameters.userFields,
      'tweet.fields': queryParameters.tweetFields,
      expansions: queryParameters.expansions.user,
    };
    queryType === queryTypes.ID ? (queryParams['ids'] = query) : (queryParams['usernames'] = query);
    const options = new APIOptions(queryParams, null, false);
    if (queryType === queryTypes.ID) return await this.client.api.users.get(options);
    if (queryType === queryTypes.USERNAME) return await this.client.api.users.by.get(options);
  }

  /**
   * Sends a request to follow a user
   * @param {string} id ID of the user to follow
   * @returns {Promise<FollowRequest>}
   */
  async follow(id) {
    const body = {
      target_user_id: id,
    };
    const apiOptions = new APIOptions(null, body, true);
    const response = await this.client.api.users(this.client.user.id).following.post(apiOptions);
    return new FollowRequest(response);
  }

  /**
   * Unfollows a user
   * @param {string} id ID of the user to unfollow
   * @returns {Promise<UnfollowRequest>}
   */
  async unfollow(id) {
    const apiOptions = new APIOptions(null, null, true);
    const response = await this.client.api.users(this.client.user.id).following(id).delete(apiOptions);
    return new UnfollowRequest(response);
  }

  /**
   * Blocks a user
   * @param {string} id The ID of the user to block
   * @returns {Promise<BlockResponse>}
   */
  async block(id) {
    const body = {
      target_user_id: id,
    };
    const apiOptions = new APIOptions(null, body, true);
    const response = await this.client.api.users(this.client.user.id).blocking.post(apiOptions);
    return new BlockResponse(response);
  }

  /**
   * Unblocks a user
   * @param {string} id The ID of the user to unblock
   * @returns {Promise<UnblockResponse>}
   */
  async unblock(id) {
    const apiOptions = new APIOptions(null, null, true);
    const response = await this.client.api.users(this.client.user.id).blocking(id).delete(apiOptions);
    return new UnblockResponse(response);
  }
}

export default UserManager;
