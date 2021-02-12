import ContextAnnotation from "../src/structures/ContextAnnotation";

interface attachments {

}

interface entities {

}

interface nonPublicMetrics {

}

interface organicMetrics {

}

interface promotedMetrics {

}

interface publicMetrics {

}

interface withheld {

}

export interface Tweet {
	id: string,
	text: string,
	created_at?: string,
	author_id?: string,
	conversation_id?: string,
	in_reply_to_user_id?: string,
	referenced_tweets?: ReferencedTweet[],
	attachments?: attachments,
	context_annotations?: ContextAnnotation[],
	entities?: entities,
	geo?: geoObject,
	lang?: string,
	non_public_metrics?: nonPublicMetrics
	organic_metrics?: organicMetrics
	possiby_sensitive?: boolean,
	promoted_metrics?: promotedMetrics,
	public_metrics?: publicMetrics,
	reply_settings?: string,
	source?: string,
	withheld?: withheld
}

interface ReferencedTweet extends Tweet {
	type: ReferencedTweetType,
	id: string,

}

enum ReferencedTweetType {
	RETWEETED = "retweeted",
	QUOTED = "quoted",
	REPLIED_TO = "replied_to"
}