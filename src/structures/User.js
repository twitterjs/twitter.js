'use strict';

import { queryParameters } from '../util/Constants.js';
import { cleanFetchFollowingResponse } from '../util/ResponseCleaner.js';
import { userBuilder } from '../util/StructureBuilder.js';
import APIOptions from './APIOptions.js';
import BaseStructure from './BaseStructure.js';
import PaginatedResponse from './PaginatedResponse.js';
import UserEntity from './UserEntity.js';
import UserPublicMetrics from './UserPublicMetrics.js';

/**
 * A user on Twitter
 * @extends BaseStructure
 */
class User extends BaseStructure {
  /**
   * @param {Client} client The client that instantiated this class
   * @param {Object} data The data for the User
   */
  constructor(client, data) {
    super(client);

    /**
     * The client that instantiated this class
     * @type {Client}
     */

    /**
     * The time the user was created at
     * @type {Date}
     */
    this.createdAt = data.created_at;

    /**
     * The description of the user
     * @type {?string}
     */
    this.description = data.description ? data.description : null;

    /**
     * Entities in the description of the user
     * @type {?UserEntity}
     */
    this.entities = data?.entities ? this._patchEntities(data.entities) : null;

    /**
     * The ID of the user
     * @type {string}
     */
    this.id = data.id;

    /**
     * The location of the user
     * @type {?string}
     */
    this.location = data.location ? data.location : null;

    /**
     * The name of the user
     * @type {string}
     */
    this.name = data.name;

    /**
     * Pinned tweet of the user, if any
     * @type {?Tweet}
     */
    this.pinnedTweet = null;

    /**
     * The pinned tweet ID of the user
     * @type {?string}
     */
    this.pinnedTweetID = data.pinned_tweet_id ? data.pinned_tweet_id : null;

    /**
     * The url of the user's profile image
     * @type {string}
     */
    this.profileImageURL = data.profile_image_url;

    /**
     * Whether the user is protected or not
     * @type {boolean}
     */
    this.protected = data.protected;

    /**
     * The public metrics of the user
     * @type {?UserPublicMetrics}
     */
    this.publicMetrics = data?.public_metrics ? this._patchPublicMetrics(data.public_metrics) : null;

    /**
     * The URL specified in the user's profile, if present.
     * @type {?string}
     */
    this.url = data.url ? data.url : null;

    /**
     * The username of the user
     * @type {string}
     */
    this.username = data.username;

    /**
     * Whether the user is verified or not
     * @type {boolean}
     */
    this.verified = data.verified;

    /**
     * Whether the user is withheld or not
     * @type {?Object}
     */
    this.withheld = null;
  }

  /**
   * Adds data to the publicMetrics property of the user
   * @param {Object} publicMetrics
   * @private
   * @returns {UserPublicMetrics}
   */
  _patchPublicMetrics(publicMetrics) {
    return new UserPublicMetrics(publicMetrics);
  }

  /**
   * Adds data to the entities property of the user
   * @param {Object} entities
   * @private
   * @returns {UserEntity}
   */
  _patchEntities(entities) {
    return new UserEntity(entities);
  }

  /**
   * Options used to fetch following of a user
   * @typedef {Object} FetchFollowingOptions
   * @property {number} [maxResults=100] Number of users to fetch per page
   * @property {string} [nextPageToken=null] Token for fetching the next page
   * @property {string} [previousPageToken=null] Token for fetching the previous page
   */

  /**
   * Fetches following of the user
   * @param {FetchFollowingOptions} options Options to fetch user following
   * @returns {Promise<PaginatedResponse>}
   */
  async fetchFollowing(options) {
    const queryParams = {
      expansions: queryParameters.expansions.user,
      max_results: options?.maxResults ?? 100,
      pagination_token: options?.nextPageToken ?? options?.previousPageToken ?? null,
      'tweet.fields': queryParameters.tweetFields,
      'user.fields': queryParameters.userFields,
    };
    const apiOptions = new APIOptions(queryParams, null, false);
    const response = await this.client.api.users(this.id).following.get(apiOptions);
    const cleanedResponse = cleanFetchFollowingResponse(response);
    const followingCollection = userBuilder(this.client, cleanedResponse);
    return new PaginatedResponse(followingCollection, response.meta);
  }

  /**
   * Options used to fetch followers of a user
   * @typedef {Object} FetchFollowersOptions
   * @property {number} [maxResults=100] Number of users to fetch per page
   * @property {string} [nextPageToken=null] Token for fetching the next page
   * @property {string} [previousPageToken=null] Token for fetching the previous page
   */

  /**
   * Fetches followers of the user
   * @param {FetchFollowersOptions} options Options to fetch user followers
   * @returns {Promise<PaginatedResponse>}
   */
  async fetchFollowers(options) {
    const queryParams = {
      expansions: queryParameters.expansions.user,
      max_results: options?.maxResults ?? 100,
      pagination_token: options?.nextPageToken ?? options?.previousPageToken ?? null,
      'tweet.fields': queryParameters.tweetFields,
      'user.fields': queryParameters.userFields,
    };
    const apiOptions = new APIOptions(queryParams, null, false);
    const response = await this.client.api.users(this.id).followers.get(apiOptions);
    const cleanedResponse = cleanFetchFollowingResponse(response);
    const followersCollection = userBuilder(this.client, cleanedResponse);
    return new PaginatedResponse(followersCollection, response.meta);
  }

  /**
   * Sends a follow request to the user
   * @returns {FollowRequest}
   */
  async follow() {
    return this.client.users.follow(this.id);
  }

  /**
   * Unfollows this user
   * @returns {UnfollowRequest}
   */
  async unfollow() {
    return this.client.users.unfollow(this.id);
  }

  /**
   * Blocks the user
   * @returns {Promise<BlockResponse>}
   */
  async block() {
    return this.client.users.block(this.id);
  }

  /**
   * Unblocks the user
   * @returns {Promise<UnblockResponse>}
   */
  async unblock() {
    return this.client.users.unblock(this.id);
  }
}

export default User;
