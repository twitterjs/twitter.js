import type {
	APITweetContextAnnotation,
	APITweetContextAnnotationDomain,
	APITweetContextAnnotationEntity,
} from 'twitter-types';

export class TweetContextAnnotation {
	domain: TweetContextAnnotationDomain;
	entity: TweetContextAnnotationEntity;

	constructor(data: APITweetContextAnnotation) {
		this.domain = new TweetContextAnnotationDomain(data.domain);
		this.entity = new TweetContextAnnotationEntity(data.entity);
	}
}

export class TweetContextAnnotationDomain {
	id: string;
	name: string;
	description: string;

	constructor(data: APITweetContextAnnotationDomain) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
	}
}

export class TweetContextAnnotationEntity extends TweetContextAnnotationDomain {
	constructor(data: APITweetContextAnnotationEntity) {
		super(data);
	}
}
