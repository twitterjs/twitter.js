import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APISpace } from 'twitter-types';

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
	}
}
