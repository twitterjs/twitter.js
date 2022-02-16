import type {
	APITweetAnnotationEntity,
	APITweetBaseEntity,
	APITweetCashtagEntity,
	APITweetEntities,
	APITweetHashtagEntity,
	APITweetMentionEntity,
	APITweetURLEntity,
} from 'twitter-types';

export class TweetEntities {
	annotations: Array<TweetAnnotationEntity>;
	cashtags: Array<TweetCashtagEntity>;
	hashtags: Array<TweetHashtagEntity>;
	mentions: Array<TweetMentionEntity>;
	urls: Array<TweetURLEntity>;

	constructor(data: APITweetEntities) {
		this.annotations = this.#patchAnnotations(data.annotations);
		this.cashtags = this.#patchCashtags(data.cashtags);
		this.hashtags = this.#patchHashtags(data.hashtags);
		this.mentions = this.#patchMentions(data.mentions);
		this.urls = this.#patchUrls(data.urls);
	}

	#patchAnnotations(rawTweetAnnotations?: Array<APITweetAnnotationEntity>): Array<TweetAnnotationEntity> {
		const tweetAnnotationsArray: Array<TweetAnnotationEntity> = [];
		if (!rawTweetAnnotations) return tweetAnnotationsArray;
		for (const rawTweetAnnotation of rawTweetAnnotations) {
			const tweetAnnotation = new TweetAnnotationEntity(rawTweetAnnotation);
			tweetAnnotationsArray.push(tweetAnnotation);
		}
		return tweetAnnotationsArray;
	}

	#patchCashtags(rawTweetCashtags?: Array<APITweetCashtagEntity>): Array<TweetCashtagEntity> {
		const tweetCashtagsArray: Array<TweetCashtagEntity> = [];
		if (!rawTweetCashtags) return tweetCashtagsArray;
		for (const rawTweetCashtag of rawTweetCashtags) {
			const tweetCashtag = new TweetCashtagEntity(rawTweetCashtag);
			tweetCashtagsArray.push(tweetCashtag);
		}
		return tweetCashtagsArray;
	}

	#patchHashtags(rawTweetHashtags?: Array<APITweetHashtagEntity>): Array<TweetHashtagEntity> {
		const tweetHashtagsArray: Array<TweetHashtagEntity> = [];
		if (!rawTweetHashtags) return tweetHashtagsArray;
		for (const rawTweetHashtag of rawTweetHashtags) {
			const tweetHashtag = new TweetHashtagEntity(rawTweetHashtag);
			tweetHashtagsArray.push(tweetHashtag);
		}
		return tweetHashtagsArray;
	}

	#patchMentions(rawTweetMentions?: Array<APITweetMentionEntity>): Array<TweetMentionEntity> {
		const tweetMentionsArray: Array<TweetMentionEntity> = [];
		if (!rawTweetMentions) return tweetMentionsArray;
		for (const rawTweetMention of rawTweetMentions) {
			const tweetMention = new TweetMentionEntity(rawTweetMention);
			tweetMentionsArray.push(tweetMention);
		}
		return tweetMentionsArray;
	}

	#patchUrls(rawTweetUrls?: Array<APITweetURLEntity>): Array<TweetURLEntity> {
		const tweetUrlsArray: Array<TweetURLEntity> = [];
		if (!rawTweetUrls) return tweetUrlsArray;
		for (const rawTweetUrl of rawTweetUrls) {
			const tweetUrl = new TweetURLEntity(rawTweetUrl);
			tweetUrlsArray.push(tweetUrl);
		}
		return tweetUrlsArray;
	}
}

export class TweetBaseEntity {
	start: number;
	end: number;

	constructor(data: APITweetBaseEntity) {
		this.start = data.start;
		this.end = data.end;
	}
}

export class TweetAnnotationEntity extends TweetBaseEntity {
	probability: number;
	type: string;
	normalizedText: string;

	constructor(data: APITweetAnnotationEntity) {
		super(data);
		this.probability = data.probability;
		this.type = data.type;
		this.normalizedText = data.normalized_text;
	}
}

export class TweetCashtagEntity extends TweetBaseEntity {
	tag: string;

	constructor(data: APITweetCashtagEntity) {
		super(data);
		this.tag = data.tag;
	}
}

export class TweetHashtagEntity extends TweetBaseEntity {
	tag: string;

	constructor(data: APITweetHashtagEntity) {
		super(data);
		this.tag = data.tag;
	}
}

export class TweetMentionEntity extends TweetBaseEntity {
	username: string;
	id: string;

	constructor(data: APITweetMentionEntity) {
		super(data);
		this.username = data.username;
		this.id = data.id;
	}
}

export class TweetURLEntity extends TweetBaseEntity {
	url: string;
	expandedURL: string;
	displayURL: string;
	status: string;
	title: string;
	description: string;
	unwoundURL: string;

	constructor(data: APITweetURLEntity) {
		super(data);
		this.url = data.url;
		this.expandedURL = data.expanded_url;
		this.displayURL = data.display_url;
		this.status = data.status;
		this.title = data.title;
		this.description = data.description;
		this.unwoundURL = data.unwound_url;
	}
}
