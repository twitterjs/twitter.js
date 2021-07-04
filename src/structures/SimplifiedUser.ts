import BaseStructure from './BaseStructure.js';
import { UserPublicMetrics } from './misc/Misc.js';
import { UserEntities } from './misc/UserEntities.js';
import type Client from '../client/Client.js';
import type { APIUserObject } from 'twitter-types';

export default class SimplifiedUser extends BaseStructure {
  /**
   * The unique identifier of the user
   */
  id: string;

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
  pinnedTweetID: string | null;

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

  constructor(client: Client, data: APIUserObject) {
    super(client, data.id);

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
}
