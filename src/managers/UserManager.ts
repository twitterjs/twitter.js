import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { RequestData, User, Tweet, SimplifiedUser, SimplifiedTweet } from '../structures';
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
	 * @example
	 * // Fetch a single user
	 * const user = await client.users.fetch({ user: '1253316035878375424' });
	 *
	 * // Fetch multiple users
	 * const users = await client.users.fetch({ users: ['1253316035878375424', '6253282'] });
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
	 * **⚠ Usernames are subject to change, prefer using {@link UserManager.fetch}**
	 * @param options The options for fetching users
	 * @returns A {@link User} or a {@link Collection} of them as a `Promise`
	 * @example
	 * // Fetch a single user
	 * const user = await client.users.fetchByUsername({ username: 'iShiibi' });
	 *
	 * // Fetch multiple users
	 * const users = await client.users.fetchByUsername({ usernames: ['iShiibi', 'TwitterAPI'] });
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
	 * @param user The user to follow
	 * @returns An object containing `following` and `pending_follow` fields
	 * @see https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following
	 * @example
	 * const data = await client.users.follow('1253316035878375424');
	 * console.log(data); // { following: true, pending_follow: false }
	 */
	async follow(user: UserResolvable): Promise<POSTUsersIdFollowingResponse['data']> {
		const userId = this.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'follow');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdFollowingJSONBody = {
			target_user_id: userId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdFollowingResponse = await this.client._api.users(loggedInUser.id).following.post(requestData);
		return { ...res.data };
	}

	/**
	 * Unfollows a user on twitter.
	 * @param user The user to unfollow
	 * @returns An object containing a `following` field
	 * @see https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/delete-users-source_id-following
	 * @example
	 * const data = await client.users.unfollow('1253316035878375424');
	 * console.log(data); // { following: false }
	 */
	async unfollow(user: UserResolvable): Promise<DELETEUsersSourceUserIdFollowingTargetUserIdResponse['data']> {
		const userId = this.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'unfollow');
		const loggedInUserId = this.client.me?.id;
		if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersSourceUserIdFollowingTargetUserIdResponse = await this.client._api
			.users(loggedInUserId)
			.following(userId)
			.delete(requestData);
		return { ...res.data };
	}

	/**
	 * Blocks a user on twitter.
	 * @param user The user to block
	 * @returns An object containing a `blocking` field
	 * @example
	 * const data = await client.users.block('1253316035878375424');
	 * console.log(data); // { blocking: true }
	 */
	async block(user: UserResolvable): Promise<POSTUsersIdBlockingResponse['data']> {
		const userId = this.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'block');
		const loggedInUserId = this.client.me?.id;
		if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdBlockingJSONBody = {
			target_user_id: userId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdBlockingResponse = await this.client._api.users(loggedInUserId).blocking.post(requestData);
		return { ...res.data };
	}

	/**
	 * Unblocks a user on twitter.
	 * @param user The user to unblock
	 * @returns An object containing a `blocking` field
	 * @example
	 * const data = await client.users.unblock('1253316035878375424');
	 * console.log(data); // { blocking: false }
	 */
	async unblock(user: UserResolvable): Promise<DELETEUsersSourceUserIdBlockingTargetUserIdResponse['data']> {
		const userId = this.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'unblock');
		const loggedInUserId = this.client.me?.id;
		if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersSourceUserIdBlockingTargetUserIdResponse = await this.client._api
			.users(loggedInUserId)
			.blocking(userId)
			.delete(requestData);
		return { ...res.data };
	}

	/**
	 * Mutes a user on twitter.
	 * @param user The user to mute
	 * @returns An object containing a `muting` field
	 * @example
	 * const data = await client.users.mute('1253316035878375424');
	 * console.log(data); // { muting: true }
	 */
	async mute(user: UserResolvable): Promise<POSTUsersIdMutingResponse['data']> {
		const userId = this.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'mute');
		const loggedInUserId = this.client.me?.id;
		if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdMutingJSONBody = {
			target_user_id: userId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdMutingResponse = await this.client._api.users(loggedInUserId).muting.post(requestData);
		return { ...res.data };
	}

	/**
	 * Unmutes a user on twitter.
	 * @param user The user to unmute
	 * @returns An object containing a `muting` field
	 * @example
	 * const data = await client.users.unmute('1253316035878375424');
	 * console.log(data); // { muting: false }
	 */
	async unmute(user: UserResolvable): Promise<DELETEUsersSourceUserIdMutingTargetUserIdResponse['data']> {
		const userId = this.resolveId(user);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'unmute');
		const loggedInUserId = this.client.me?.id;
		if (!loggedInUserId) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersSourceUserIdMutingTargetUserIdResponse = await this.client._api
			.users(loggedInUserId)
			.muting(userId)
			.delete(requestData);
		return { ...res.data };
	}

	/**
	 * Fetches a single user by using its id.
	 * @param userId The id of the user to fetch
	 * @param options The options for fetching the user
	 * @returns A {@link User}
	 */
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
		const res: GETUsersIdResponse = await this.client._api.users(userId).get(requestData);
		return new User(this.client, res);
	}

	/**
	 * Fetches multiple users by using their ids.
	 * @param userIds The ids of the users to fetch
	 * @param options The options for fetching the users
	 * @returns A {@link Collection} of {@link User}
	 */
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
		const res: GETUsersResponse = await this.client._api.users.get(requestData);
		const rawUsers = res.data;
		const rawUsersIncludes = res.includes;
		for (const rawUser of rawUsers) {
			const user = this._add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
			fetchedUserCollection.set(user.id, user);
		}
		return fetchedUserCollection;
	}

	/**
	 * Fetches a single user by using its username.
	 * @param username The username of the user to fetch
	 * @param options The options for fethcing the user
	 * @returns A {@link User}
	 */
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
		const res: GETUsersByUsernameUsernameResponse = await this.client._api.users.by.username(username).get(requestData);
		return new User(this.client, res);
	}

	/**
	 * Fetches multiple users by using their usernames.
	 * @param usernames The usernames of the users to fetch
	 * @param options The options for fetching the users
	 * @returns A {@link Collection} of {@link User}
	 */
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
		const res: GETUsersByResponse = await this.client._api.users.by.get(requestData);
		const rawUsers = res.data;
		const rawUsersIncludes = res.includes;
		for (const rawUser of rawUsers) {
			const user = this._add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options.cacheAfterFetching);
			fetchedUserCollection.set(user.id, user);
		}
		return fetchedUserCollection;
	}
}
