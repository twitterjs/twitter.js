import { BaseStructure } from './BaseStructure';
import { UserPublicMetrics, UserEntities, UserWitheld } from './misc';
import type { Client } from '../client';
import type {
	APIUser,
	DELETEUsersSourceUserIdBlockingTargetUserIdResponse,
	DELETEUsersSourceUserIdFollowingTargetUserIdResponse,
	DELETEUsersSourceUserIdMutingTargetUserIdResponse,
	POSTUsersIdBlockingResponse,
	POSTUsersIdFollowingResponse,
	POSTUsersIdMutingResponse,
} from 'twitter-types';

/**
 * A simplified version of {@link User} class
 */
export class SimplifiedUser extends BaseStructure {
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
	pinnedTweetId: string | null;

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
		super(client, data);
		this.name = data.name;
		this.username = data.username;
		this.createdAt = data.created_at ? new Date(data.created_at) : null;
		this.description =
			typeof data.description === 'string' ? (data.description.length > 0 ? data.description : null) : null;
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
	 */
	async follow(): Promise<POSTUsersIdFollowingResponse['data']> {
		return this.client.users.follow(this.id);
	}

	/**
	 * Unfollows this user on twitter.
	 */
	async unfollow(): Promise<DELETEUsersSourceUserIdFollowingTargetUserIdResponse['data']> {
		return this.client.users.unfollow(this.id);
	}

	/**
	 * Blocks this user on twitter.
	 */
	async block(): Promise<POSTUsersIdBlockingResponse['data']> {
		return this.client.users.block(this.id);
	}

	/**
	 * Unblocks this user on twitter.
	 */
	async unblock(): Promise<DELETEUsersSourceUserIdBlockingTargetUserIdResponse['data']> {
		return this.client.users.unblock(this.id);
	}

	/**
	 * Mutes this user on twitter.
	 */
	async mute(): Promise<POSTUsersIdMutingResponse['data']> {
		return this.client.users.mute(this.id);
	}

	/**
	 * Unmutes this user on twitter.
	 */
	async unmute(): Promise<DELETEUsersSourceUserIdMutingTargetUserIdResponse['data']> {
		return this.client.users.unmute(this.id);
	}
}
