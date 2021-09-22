import { BaseStructure } from './BaseStructure';
import { UserPublicMetrics, UserEntities, UserWitheld } from './misc';
import { FollowersBook, FollowingsBook } from '../books';
import type { User } from './User';
import type { Client } from '../client';
import type { Collection } from '../util';
import type { APIUser, Snowflake } from 'twitter-types';
import type {
  UserFollowResponse,
  UserUnfollowResponse,
  UserBlockResponse,
  UserUnblockResponse,
  UserMuteResponse,
  UserUnmuteResponse,
} from './misc';

/**
 * A simplified version of {@link User} class
 */
export class SimplifiedUser extends BaseStructure {
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
  pinnedTweetId: Snowflake | null;

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
  withheld: UserWitheld | null;

  constructor(client: Client, data: APIUser) {
    super(client);

    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.createdAt = data.created_at ? new Date(data.created_at) : null;
    this.description = data.description ?? null;
    this.entities = data.entities ? new UserEntities(data.entities) : null;
    this.location = data.location ?? null;
    this.pinnedTweetId = data.pinned_tweet_id ?? null;
    this.profileImageURL = data.profile_image_url ?? null;
    this.protected = data.protected ?? null;
    this.publicMetrics = data.public_metrics ? new UserPublicMetrics(data.public_metrics) : null;
    this.url = data.url ?? null;
    this.verified = data.verified ?? null;
    this.withheld = data.withheld ? new UserWitheld(data.withheld) : null;
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
   * Fetches followers of this user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page of the book. The API will default this to `100` if not provided
   * @returns A tuple containing {@link FollowersBook} object and a {@link Collection} of {@link User} objects representing the first page
   */
  async fetchFollowers(maxResultsPerPage?: number): Promise<[FollowersBook, Collection<Snowflake, User>]> {
    return this.client.users.fetchFollowers(this.id, maxResultsPerPage);
  }

  /**
   * Fetches users followed by this user.
   * @param maxResultsPerPage The maximum amount of users to fetch per page of the book. The API will default this to `100` if not provided
   * @returns A tuple containing {@link FollowingsBook} object and a {@link Collection} of {@link User} objects representing the first page
   */
  async fetchFollowings(maxResultsPerPage?: number): Promise<[FollowingsBook, Collection<Snowflake, User>]> {
    return this.client.users.fetchFollowings(this.id, maxResultsPerPage);
  }
}
