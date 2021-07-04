import User from '../structures/User.js';
import BaseManager from './BaseManager.js';
import Collection from '../util/Collection.js';
import { RequestData } from '../structures/misc/Misc.js';
import { CustomError, CustomTypeError } from '../errors/index.js';
import type Client from '../client/Client.js';
import type { UserManagerFetchResult, UserResolvable } from '../typings/Types.js';
import type { FetchUserOptions, FetchUsersOptions } from '../typings/Interfaces.js';
import type {
  GetMultipleUsersByIdsQuery,
  GetMultipleUsersByIdsResponse,
  GetSingleUserByIdQuery,
  GetSingleUserByIdResponse,
} from 'twitter-types';

/**
 * Holds API methods for {@link User} objects and stores their cache
 */
export default class UserManager extends BaseManager<UserResolvable, User> {
  constructor(client: Client) {
    super(client, User);
  }

  async fetch<T extends FetchUserOptions | FetchUsersOptions>(options: T): Promise<UserManagerFetchResult<T>> {
    if (typeof options !== 'object') throw new CustomTypeError('INVALID_TYPE', 'options', 'Object', true);
    if ('user' in options) {
      const userID = this.resolveID(options.user);
      if (!userID) throw new CustomError('USER_RESOLVE_ID');
      return this._fetchSingleUser(userID, options) as Promise<UserManagerFetchResult<T>>;
    }
    if ('users' in options) {
      if (!Array.isArray(options.users)) throw new CustomTypeError('FETCH_USERS_TYPE');
      const userIDs = options.users.map(user => {
        const userID = this.resolveID(user);
        if (!userID) throw new CustomError('FETCH_USERS_TYPE');
        return userID;
      });
      return this._fetchMultipleUsers(userIDs, options) as Promise<UserManagerFetchResult<T>>;
    }
    throw new CustomError('INVALID_FETCH_OPTIONS');
  }

  private async _fetchSingleUser(userID: string, options: FetchUserOptions): Promise<User> {
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
    const requestData = new RequestData(query, null, options.cacheAfterFetching);
    const data: GetSingleUserByIdResponse = await this.client._api.users(userID).get(requestData);
    return new User(this.client, data);
  }

  private async _fetchMultipleUsers(
    userIDs: Array<string>,
    options: FetchUsersOptions,
  ): Promise<Collection<string, User>> {
    const fetchedUserCollection = new Collection<string, User>();
    const queryParameters = this.client.options.queryParameters;
    const query: GetMultipleUsersByIdsQuery = {
      ids: userIDs,
      expansions: queryParameters?.userExpansions,
      'tweet.fields': queryParameters?.tweetFields,
      'user.fields': queryParameters?.userFields,
    };
    const requestData = new RequestData(query, null, options.userContext);
    const data: GetMultipleUsersByIdsResponse = await this.client._api.users.get(requestData);
    const rawUsers = data.data;
    const rawUsersIncludes = data.includes;
    for (const rawUser of rawUsers) {
      const user = this.add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
      fetchedUserCollection.set(user.id, user);
    }
    return fetchedUserCollection;
  }
}
