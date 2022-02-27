import { Collection } from '../util';
import { BaseManager, type BaseFetchOptions } from './BaseManager';
import { CustomError, CustomTypeError } from '../errors';
import { RequestData, User, Tweet, SimplifiedUser, SimplifiedTweet } from '../structures';
import type { Client } from '../client';
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
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link User} objects and stores their cache
 */
export class UserManager extends BaseManager<string, UserResolvable, User> {
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
	override resolveId(userResolvable: UserResolvable): string | null {
		const userId = super.resolveId(userResolvable);
		if (typeof userId === 'string') return userId;
		if (userResolvable instanceof SimplifiedUser) return userResolvable.id;
		if (userResolvable instanceof Tweet || userResolvable instanceof SimplifiedTweet) return userResolvable.authorId;
		return null;
	}

	/**
	 * Fetches one or more users.
	 * @param userOrUsers The user or users to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link User} or a {@link Collection} of them
	 * @example
	 * // Fetch a single user
	 * const user = await client.users.fetch('1253316035878375424');
	 *
	 * // Fetch multiple users
	 * const users = await client.users.fetch(['1253316035878375424', '6253282']);
	 */
	async fetch<U extends UserResolvable | Array<UserResolvable>>(
		userOrUsers: U,
		options?: FetchUserOrUsersOptions<U>,
	): Promise<UserManagerFetchResult<U>> {
		if (Array.isArray(userOrUsers)) {
			const userIds = userOrUsers.map(user => {
				const userId = this.resolveId(user);
				if (!userId) throw new CustomError('USER_RESOLVE_ID', 'fetch');
				return userId;
			});
			// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
			return this.#fetchMultipleUsersByIds(userIds, options);
		}
		const userId = this.resolveId(userOrUsers);
		if (!userId) throw new CustomError('USER_RESOLVE_ID', 'fetch');
		// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
		return this.#fetchSingleUserById(userId, options);
	}

	/**
	 * Fetches one or more users using their usernames.
	 *
	 * **⚠ Usernames are subject to change, prefer using {@link UserManager.fetch}**
	 * @param usernameOrUsernames The username(s) of user or users to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link User} or a {@link Collection} of them
	 * @example
	 * // Fetch a single user
	 * const user = await client.users.fetchByUsername('iShiibi');
	 *
	 * // Fetch multiple users
	 * const users = await client.users.fetchByUsername(['iShiibi', 'TwitterAPI']);
	 */
	async fetchByUsername<U extends string | Array<string>>(
		usernameOrUsernames: U,
		options?: FetchUserOrUsersByUsernameOptions<U>,
	): Promise<UserManagerFetchByUsernameResult<U>> {
		if (Array.isArray(usernameOrUsernames)) {
			const usernames = usernameOrUsernames.map(username => {
				if (typeof username !== 'string')
					throw new CustomTypeError('INVALID_TYPE', 'username in the usernames array', 'string', false);
				return username;
			});
			// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
			return this.#fetchMultipleUsersByUsernames(usernames, options);
		}
		if (typeof usernameOrUsernames !== 'string') throw new CustomTypeError('INVALID_TYPE', 'username', 'string', false);
		// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
		return this.#fetchSingleUserByUsername(usernameOrUsernames, options);
	}

	/**
	 * Follows a user.
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
		return res.data;
	}

	/**
	 * Unfollows a user.
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
		return res.data;
	}

	/**
	 * Blocks a user.
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
		return res.data;
	}

	/**
	 * Unblocks a user.
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
		return res.data;
	}

	/**
	 * Mutes a user.
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
		return res.data;
	}

	/**
	 * Unmutes a user.
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
		return res.data;
	}

	/**
	 * Fetches a single user by using its id.
	 * @param userId The id of the user to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link User}
	 */
	async #fetchSingleUserById(userId: string, options?: FetchUserOptions): Promise<User> {
		if (!options?.skipCacheCheck) {
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
		return this._add(res.data.id, res, options?.cacheAfterFetching);
	}

	/**
	 * Fetches multiple users by using their ids.
	 * @param userIds The ids of the users to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link User}
	 */
	async #fetchMultipleUsersByIds(
		userIds: Array<string>,
		options?: FetchUsersOptions,
	): Promise<Collection<string, User>> {
		const fetchedUsers = new Collection<string, User>();
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
			const user = this._add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options?.cacheAfterFetching);
			fetchedUsers.set(user.id, user);
		}
		return fetchedUsers;
	}

	/**
	 * Fetches a single user by using its username.
	 * @param username The username of the user to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link User}
	 */
	async #fetchSingleUserByUsername(username: string, options?: FetchUserByUsernameOptions): Promise<User> {
		if (!options?.skipCacheCheck) {
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
		return this._add(res.data.id, res, options?.cacheAfterFetching);
	}

	/**
	 * Fetches multiple users by using their usernames.
	 * @param usernames The usernames of the users to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link User}
	 */
	async #fetchMultipleUsersByUsernames(
		usernames: Array<string>,
		options?: FetchUsersByUsernamesOptions,
	): Promise<Collection<string, User>> {
		const fetchedUsers = new Collection<string, User>();
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
			const user = this._add(rawUser.id, { data: rawUser, includes: rawUsersIncludes }, options?.cacheAfterFetching);
			fetchedUsers.set(user.id, user);
		}
		return fetchedUsers;
	}
}

/**
 * Options used to fetch a single user
 */
export type FetchUserOptions = BaseFetchOptions;

/**
 * Options used to fetch multiple users
 */
export type FetchUsersOptions = Omit<BaseFetchOptions, 'skipCacheCheck'>;

/**
 * Options used to fetch a single user by its username
 */
export type FetchUserByUsernameOptions = BaseFetchOptions;

/**
 * Options used to fetch multiple users by their usernames
 */
export type FetchUsersByUsernamesOptions = Omit<BaseFetchOptions, 'skipCacheCheck'>;

/**
 * Options used to fetch one or more users
 */
export type FetchUserOrUsersOptions<U extends UserResolvable | Array<UserResolvable>> = U extends UserResolvable
	? FetchUserOptions
	: FetchUsersOptions;

export type UserManagerFetchResult<U extends UserResolvable | Array<UserResolvable>> = U extends UserResolvable
	? User
	: Collection<string, User>;

/**
 * Options used to fetch one or more users by using their usernames
 */
export type FetchUserOrUsersByUsernameOptions<U extends string | Array<string>> = U extends string
	? FetchUserByUsernameOptions
	: FetchUsersByUsernamesOptions;

export type UserManagerFetchByUsernameResult<U extends string | Array<string>> = U extends string
	? User
	: Collection<string, User>;

export type UserResolvable = User | SimplifiedUser | Tweet | SimplifiedTweet | string;
