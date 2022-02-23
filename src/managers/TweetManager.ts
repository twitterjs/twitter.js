import { Collection } from '../util';
import { BaseManager } from './BaseManager';
import { RequestData, SimplifiedTweet, Tweet, TweetPayload } from '../structures';
import { CustomError } from '../errors';
import type { Client } from '../client';
import type { TweetResolvable, TweetCreateOptions, BaseFetchOptions } from '../typings';
import type {
	DELETETweetsIdResponse,
	DELETEUsersIdLikesTweetIdResponse,
	DELETEUsersIdRetweetsSourceTweetIdResponse,
	GETTweetsIdQuery,
	GETTweetsIdResponse,
	GETTweetsQuery,
	GETTweetsResponse,
	POSTTweetsResponse,
	POSTUsersIdLikesJSONBody,
	POSTUsersIdLikesResponse,
	POSTUsersIdRetweetsJSONBody,
	POSTUsersIdRetweetsResponse,
	PUTTweetsIdHiddenJSONBody,
	PUTTweetsIdHiddenResponse,
} from 'twitter-types';

/**
 * The manager class that holds API methods for {@link Tweet} objects and stores their cache
 */
export class TweetManager extends BaseManager<string, TweetResolvable, Tweet> {
	/**
	 * @param client The logged in {@link Client} instance
	 */
	constructor(client: Client) {
		super(client, Tweet);
	}

	/**
	 * Resolves a tweet resolvable to its respective {@link Tweet} object.
	 * @param tweetResolvable An Id or instance that can be resolved to a tweet object
	 * @returns The resolved tweet object
	 */
	override resolve(tweetResolvable: TweetResolvable): Tweet | null {
		const tweet = super.resolve(tweetResolvable);
		if (tweet) return tweet;
		if (tweetResolvable instanceof SimplifiedTweet) return super.resolve(tweetResolvable.id);
		return null;
	}

	/**
	 * Resolves a tweet resolvable to its respective id.
	 * @param tweetResolvable An Id or instance that can be resolved to a tweet object
	 * @returns The id of the resolved tweet object
	 */
	override resolveId(tweetResolvable: TweetResolvable): string | null {
		const tweetId = super.resolveId(tweetResolvable);
		if (typeof tweetId === 'string') return tweetId;
		if (tweetResolvable instanceof SimplifiedTweet) return tweetResolvable.id;
		return null;
	}

	/**
	 * Fetches one or more tweets.
	 * @param tweetOrTweets The tweet or tweets to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Tweet} or a {@link Collection} of them
	 * @example
	 * // Fetch a single tweet
	 * const tweet = await client.tweets.fetch('1336749579228745728');
	 *
	 * // Fetch multiple tweets
	 * const tweets = await client.tweets.fetch(['1336749579228745728', '1413113670448553986']);
	 */
	async fetch<T extends TweetResolvable | Array<TweetResolvable>>(
		tweetOrTweets: T,
		options?: FetchTweetOrTweetsOptions<T>,
	): Promise<TweetManagerFetchResult<T>> {
		if (Array.isArray(tweetOrTweets)) {
			const tweetIds = tweetOrTweets.map(tweet => {
				const tweetId = this.resolveId(tweet);
				if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
				return tweetId;
			});
			// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
			return this.#fetchMultipleTweetsByIds(tweetIds, options);
		}
		const tweetId = this.resolveId(tweetOrTweets);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'fetch');
		// @ts-expect-error UserManagerFetchResult<U> is a conditional type, TS seems to not work when conditional types and promises are combined together
		return this.#fetchSingleTweetById(tweetId, options);
	}

	/**
	 * Likes a tweet.
	 * @param tweet The tweet to like
	 * @returns An object containing the `liked` field
	 * @example
	 * const data = await client.tweets.like('1336749579228745728');
	 * console.log(data); // { liked: true }
	 */
	async like(tweet: TweetResolvable): Promise<POSTUsersIdLikesResponse['data']> {
		const tweetId = this.resolveId(tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'like');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdLikesJSONBody = {
			tweet_id: tweetId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdLikesResponse = await this.client._api.users(loggedInUser.id).likes.post(requestData);
		return res.data;
	}

	/**
	 * Unlikes a tweet.
	 * @param tweet The tweet to unlike
	 * @returns An object containing the `liked` field
	 * @example
	 * const data = await client.tweets.unlike('1336749579228745728');
	 * console.log(data); // { liked: false }
	 */
	async unlike(tweet: TweetResolvable): Promise<DELETEUsersIdLikesTweetIdResponse['data']> {
		const tweetId = this.resolveId(tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'unlike');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersIdLikesTweetIdResponse = await this.client._api
			.users(loggedInUser.id)
			.likes(tweetId)
			.delete(requestData);
		return res.data;
	}

	/**
	 * Hides a reply to a tweet created by the authorized user.
	 * @param tweet The reply to hide
	 * @returns An object containing the `hidden` field
	 * @example
	 * const data = await client.tweets.hide('1487374434654912517');
	 * console.log(data); // { hidden: true }
	 */
	async hide(tweet: TweetResolvable): Promise<PUTTweetsIdHiddenResponse['data']> {
		return this.#editTweetReplyVisibility(tweet, 'hidden');
	}

	/**
	 * Unhides a reply to a tweet created by the authorized user.
	 * @param tweet The reply to unhide
	 * @returns An object containing the `hidden` field
	 * @example
	 * const data = await client.tweets.unhide('1487374434654912517');
	 * console.log(data); // { hidden: false }
	 */
	async unhide(tweet: TweetResolvable): Promise<PUTTweetsIdHiddenResponse['data']> {
		return this.#editTweetReplyVisibility(tweet, 'unhidden');
	}

	/**
	 * Retweets a tweet.
	 * @param tweet The tweet to retweet
	 * @returns An object containing the `retweeted` field
	 * @example
	 * const data = await client.tweets.retweet('1482736526950023178');
	 * console.log(data); // { retweeted: true }
	 */
	async retweet(tweet: TweetResolvable): Promise<POSTUsersIdRetweetsResponse['data']> {
		const tweetId = this.resolveId(tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'retweet');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const body: POSTUsersIdRetweetsJSONBody = {
			tweet_id: tweetId,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTUsersIdRetweetsResponse = await this.client._api.users(loggedInUser.id).retweets.post(requestData);
		return res.data;
	}

	/**
	 * Removes the retweet of a tweet.
	 * @param tweet The tweet whose retweet is to be removed
	 * @returns An object containing the `retweeted` field
	 * @example
	 * const data = await client.tweets.unRetweet('1482736526950023178');
	 * console.log(data); // { retweeted: false }
	 */
	async unRetweet(tweet: TweetResolvable): Promise<DELETEUsersIdRetweetsSourceTweetIdResponse['data']> {
		const tweetId = this.resolveId(tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'remove retweet');
		const loggedInUser = this.client.me;
		if (!loggedInUser) throw new CustomError('NO_LOGGED_IN_USER');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETEUsersIdRetweetsSourceTweetIdResponse = await this.client._api
			.users(loggedInUser.id)
			.retweets(tweetId)
			.delete(requestData);
		return res.data;
	}

	/**
	 * Creates a new tweet.
	 * @param options The options for creating the tweet
	 * @returns The id and text of the created tweet
	 * @example
	 * const data = await client.tweets.create({ text: 'This is a tweet' });
	 * console.log(data); // { id: '1487382074546089985', text: 'This is a tweet' }
	 */
	async create(options: TweetCreateOptions): Promise<POSTTweetsResponse['data']> {
		const body = new TweetPayload(this.client, options).resolveData();
		const requestData = new RequestData({ body, isUserContext: true });
		const res: POSTTweetsResponse = await this.client._api.tweets.post(requestData);
		return res.data;
	}

	/**
	 * Deletes a tweet created by the authorized user.
	 * @param tweet The tweet to delete
	 * @returns An object containing the `deleted` field
	 * @example
	 * const data = await client.tweets.delete('1487382074546089985');
	 * console.log(data); // { deleted: true }
	 */
	async delete(tweet: TweetResolvable): Promise<DELETETweetsIdResponse['data']> {
		const tweetId = this.resolveId(tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', 'delete');
		const requestData = new RequestData({ isUserContext: true });
		const res: DELETETweetsIdResponse = await this.client._api.tweets(tweetId).delete(requestData);
		return res.data;
	}

	/**
	 * Fetches a single tweet using its id.
	 * @param tweetId The id of the tweet to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Tweet}
	 */
	async #fetchSingleTweetById(tweetId: string, options?: FetchTweetOptions): Promise<Tweet> {
		if (!options?.skipCacheCheck) {
			const cachedTweet = this.cache.get(tweetId);
			if (cachedTweet) return cachedTweet;
		}
		const queryParameters = this.client.options.queryParameters;
		const query: GETTweetsIdQuery = {
			expansions: queryParameters?.tweetExpansions,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETTweetsIdResponse = await this.client._api.tweets(tweetId).get(requestData);
		return this._add(res.data.id, res, options?.cacheAfterFetching);
	}

	/**
	 * Fetches multiple tweets using their ids.
	 * @param tweetIds The ids of the tweets to fetch
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link Tweet}
	 */
	async #fetchMultipleTweetsByIds(
		tweetIds: Array<string>,
		options?: FetchTweetsOptions,
	): Promise<Collection<string, Tweet>> {
		const fetchedTweets = new Collection<string, Tweet>();
		const queryParameters = this.client.options.queryParameters;
		const query: GETTweetsQuery = {
			ids: tweetIds,
			expansions: queryParameters?.tweetExpansions,
			'media.fields': queryParameters?.mediaFields,
			'place.fields': queryParameters?.placeFields,
			'poll.fields': queryParameters?.pollFields,
			'tweet.fields': queryParameters?.tweetFields,
			'user.fields': queryParameters?.userFields,
		};
		const requestData = new RequestData({ query });
		const res: GETTweetsResponse = await this.client._api.tweets.get(requestData);
		const rawTweets = res.data;
		const rawTweetsIncludes = res.includes;
		for (const rawTweet of rawTweets) {
			const tweet = this._add(
				rawTweet.id,
				{ data: rawTweet, includes: rawTweetsIncludes },
				options?.cacheAfterFetching,
			);
			fetchedTweets.set(tweet.id, tweet);
		}
		return fetchedTweets;
	}

	/**
	 * Change the visibility of a reply to a tweet of the authorized user.
	 * @param tweet The tweet to hide or unhide
	 * @param visibility The visibility to set
	 * @returns An object containing the `hidden` field
	 */
	async #editTweetReplyVisibility(
		tweet: TweetResolvable,
		visibility: 'hidden' | 'unhidden',
	): Promise<PUTTweetsIdHiddenResponse['data']> {
		const tweetId = this.resolveId(tweet);
		if (!tweetId) throw new CustomError('TWEET_RESOLVE_ID', `${visibility === 'hidden' ? 'hide' : 'unhide'}`);
		const body: PUTTweetsIdHiddenJSONBody = {
			hidden: visibility === 'hidden' ? true : false,
		};
		const requestData = new RequestData({ body, isUserContext: true });
		const res: PUTTweetsIdHiddenResponse = await this.client._api.tweets(tweetId).hidden.put(requestData);
		return res.data;
	}
}

/**
 * Options used to feth a single tweet
 */
export type FetchTweetOptions = BaseFetchOptions;

/**
 * Options used to feth multiple tweets
 */
export type FetchTweetsOptions = Omit<BaseFetchOptions, 'skipCacheCheck'>;

/**
 * Options used to fetch one or more tweets
 */
export type FetchTweetOrTweetsOptions<T extends TweetResolvable | Array<TweetResolvable>> = T extends TweetResolvable
	? FetchTweetOptions
	: FetchTweetsOptions;

export type TweetManagerFetchResult<T extends TweetResolvable | Array<TweetResolvable>> = T extends TweetResolvable
	? Tweet
	: Collection<string, Tweet>;
