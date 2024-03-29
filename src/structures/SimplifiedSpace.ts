import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APISpace } from 'twitter-types';
import type { FetchSpaceSharedTweetsOptions } from '../managers';

export class SimplifiedSpace extends BaseStructure {
	/**
	 * Indicates if the Space has started or will start in the future, or if it has ended
	 */
	state: string;

	/**
	 * Creation time of this Space
	 */
	createdAt: Date | null;

	/**
	 * The unique identifier of the Users who are hosting this Space
	 */
	hostIds: Array<string>;

	/**
	 * Language of the Space, if detected by Twitter. Returned as a `BCP47` language tag
	 */
	lang: string | null;

	/**
	 * Indicates whether this is a ticketed Space
	 */
	isTicketed: boolean | null;

	/**
	 * The list of user IDs that were invited to join as speakers.
	 * Usually, users in this list are invited to speak via the Invite user option
	 */
	invitedUserIds: Array<string>;

	/**
	 * The current number of users in the Space, including Hosts and Speakers
	 */
	participantCount: number | null;

	/**
	 * Indicates the start time of a scheduled Space, as set by the creator of the Space.
	 * This field is returned only if the Space has been scheduled; in other words,
	 * if the field is returned, it means the Space is a scheduled Space
	 */
	scheduledStart: Date | null;

	/**
	 * The list of users who were speaking at any point during the Space.
	 * This list contains all the users in `invited_user_ids` in addition to
	 * any user who requested to speak and was allowed via the Add speaker option
	 */
	speakerIds: Array<string>;

	/**
	 * Indicates the actual start time of a Space
	 */
	startedAt: Date | null;

	/**
	 * The title of the Space as specified by the creator
	 */
	title: string | null;

	/**
	 * Specifies the date and time of the last update to any of the Space's metadata, such as its title or scheduled time
	 */
	updatedAt: Date | null;

	/**
	 * The id of the user who created this space
	 */
	creatorId: string | null;

	// TODO: this field is only available when the request is made using `OAuth 2.0 Authorization Code with PKCE`.
	// API returns an error instead of a partial error if the request is made using some other authentication method.
	// Open an issue at https://twittercommunity.com
	/**
	 * The number of people who have either purchased a ticket or set a reminder for this space
	 */
	subscriberCount: number | null;

	constructor(client: Client, data: APISpace) {
		super(client, data);
		this.state = data.state;
		this.createdAt = data.created_at ? new Date(data.created_at) : null;
		this.creatorId = data.creator_id ?? null;
		this.hostIds = data.host_ids ?? [];
		this.invitedUserIds = data.invited_user_ids ?? [];
		this.isTicketed = data.is_ticketed ?? null;
		this.lang = data.lang ?? null;
		this.participantCount = data.participant_count ?? null;
		this.scheduledStart = data.scheduled_start ? new Date(data.scheduled_start) : null;
		this.speakerIds = data.speaker_ids ?? [];
		this.startedAt = data.started_at ? new Date(data.started_at) : null;
		this.title = data.title ?? null;
		this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
		this.subscriberCount = data.subscriber_count ?? null;
	}

	/**
	 * Fetches tweets shared in this space.
	 * @param options An object containing optional parameters to apply
	 * @returns A {@link Collection} of {@link Tweet}
	 */
	async fetchSharedTweets(options?: FetchSpaceSharedTweetsOptions) {
		return this.client.spaces.fetchSharedTweets(this.id, options);
	}
}
