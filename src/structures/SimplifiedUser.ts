import BaseStructure from './BaseStructure.js';
import { UserPublicMetrics } from './misc/Misc.js';
import { UserEntities } from './misc/UserEntities.js';
import type Client from '../client/Client.js';
import type FollowersBook from './books/FollowersBook.js';
import type FollowingsBook from './books/FollowingsBook.js';
import type { APIUser, Snowflake } from 'twitter-types';
import type {
  UserFollowResponse,
  UserUnfollowResponse,
  UserBlockResponse,
  UserUnblockResponse,
  UserMuteResponse,
  UserUnmuteResponse,
} from './misc/Misc.js';

/**
 * A simplified version of {@link User} class
 */
export default class SimplifiedUser extends BaseStructure {
  /**
   * The unique identifier of the user
   */
  id: Snowflake;

  /**
   * The name of the user, as they’ve defined it on their profile. Not necessarily a person’s name.
   * Typically capped at `50` characters, but subject to change
   */
  name: string;

  /**
   * The Twitter screen name, handle, or alias that this user identifies themselves with. Usernames are unique but
   * subject to change. Typically a maximum of `15` characters long, but some historical accounts may exist with longer
   * names
   */
  username: string;

  /**
   * The UTC datetime that the user account was created on Twitter
   */
  createdAt: Date | null;

  /**
   * The text of this user's profile description (also known as bio), if the user provided one
   */
  description: string | null;

  /**
   * Contains details about text that has a special meaning in the user's description
   */
  entities: UserEntities | null;

  /**
   * The location specified in the user's profile, if the user provided one. As this is a freeform value,
   * it may not indicate a valid location, but it may be fuzzily evaluated when performing searches with
   * location queries
   */
  location: string | null;

  /**
   * The unique identifier of this user's pinned Tweet
   */
  pinnedTweetID: Snowflake | null;

  /**
   * The URL to the profile image for this user, as shown on the user's profile
   */
  profileImageURL: string | null;

  /**
   * Indicates if this user has chosen to protect their Tweets (in other words, if this user's Tweets are private)
   */
  protected: boolean | null;

  /**
   * Contains details about activity for this user
   */
  publicMetrics: UserPublicMetrics | null;

  /**
   * The URL specified in the user's profile, if present
   */
  url: string | null;

  /**
   * Indicates if this user is a verified Twitter User
   */
  verified: boolean | null;

  /**
   * Contains withholding details for withheld content, if applicable
   */
  withheld?: any; // TODO

  constructor(client: Client, data: APIUser) {
    super(client);

    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.createdAt = data.created_at ?? null;
    this.description = data.description ?? null;
    this.entities = data.entities ? new UserEntities(data.entities) : null;
    this.location = data.location ?? null;
    this.pinnedTweetID = data.pinned_tweet_id ?? null;
    this.profileImageURL = data.profile_image_url ?? null;
    this.protected = data.protected ?? null;
    this.publicMetrics = data.public_metrics ? new UserPublicMetrics(data.public_metrics) : null;
    this.url = data.url ?? null;
    this.verified = data.verified ?? null;
    this.withheld = data.withheld;
  }

  /**
   * Follows this user on twitter.
   * @returns A {@link UserFollowResponse} object
   */
  async follow(): Promise<UserFollowResponse> {
    return this.client.users.follow(this.id);
  }

  /**
   * Unfollows this user on twitter.
   * @returns A {@link UserUnfollowResponse} object
   */
  async unfollow(): Promise<UserUnfollowResponse> {
    return this.client.users.unfollow(this.id);
  }

  /**
   * Blocks this user on twitter.
   * @returns A {@link UserBlockResponse} object
   */
  async block(): Promise<UserBlockResponse> {
    return this.client.users.block(this.id);
  }

  /**
   * Unblocks this user on twitter.
   * @returns A {@link UserUnblockResponse} object
   */
  async unblock(): Promise<UserUnblockResponse> {
    return this.client.users.unblock(this.id);
  }

  /**
   * Mutes this user on twitter.
   * @returns A {@link UserMuteResponse} object
   */
  async mute(): Promise<UserMuteResponse> {
    return this.client.users.mute(this.id);
  }

  /**
   * Unmutes this user on twitter.
   * @returns A {@link UserUnmuteResponse} object
   */
  async unmute(): Promise<UserUnmuteResponse> {
    return this.client.users.unmute(this.id);
  }

  /**
   * Creates a {@link FollowersBook} object for fetching followers of this user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page of the book. The API will default this to `100` if not provided
   * @returns A {@link FollowersBook} object
   */
  createFollowersBook(maxResultsPerPage?: number): FollowersBook {
    return this.client.users.createFollowersBook(this.id, maxResultsPerPage) as FollowersBook;
  }

  /**
   * Creates a {@link FollowingsBook} object for fetching users followed by this user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page of the book. The API will default this to `100` if not provided
   * @returns A {@link FollowingsBook} object
   */
  createFollowingBook(maxResultsPerPage?: number): FollowingsBook {
    return this.client.users.createFollowingBook(this.id, maxResultsPerPage) as FollowingsBook;
  }
}
