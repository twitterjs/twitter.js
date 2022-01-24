import type {
	APIMediaNonPublicMetrics,
	APIMediaOrganicMetrics,
	APIMediaPromotedMetrics,
	APIMediaPublicMetrics,
} from 'twitter-types';

export class MediaNonPublicMetrics {
	/**
	 * Number of users who made it through 0% of the video
	 */
	playbackCountZero: number;

	/**
	 * Number of users who made it through 25% of the video
	 */
	playbackCountTwentyFive: number;

	/**
	 * Number of users who made it through 50% of the video
	 */
	playbackCountFifty: number;

	/**
	 * Number of users who made it through 75% of the video
	 */
	playbackCountSeventyFive: number;

	/**
	 * Number of users who made it through 100% of the video
	 */
	playbackCountHundred: number;

	constructor(data: APIMediaNonPublicMetrics) {
		this.playbackCountZero = data.playback_0_count;
		this.playbackCountTwentyFive = data.playback_25_count;
		this.playbackCountFifty = data.playback_50_count;
		this.playbackCountSeventyFive = data.playback_75_count;
		this.playbackCountHundred = data.playback_100_count;
	}
}

export class MediaPublicMetrics {
	/**
	 * Number of times this video has been viewed
	 */
	viewCount: number;

	constructor(data: APIMediaPublicMetrics) {
		this.viewCount = data.view_count;
	}
}

export class MediaPublicNonPublicMetricsUnion extends MediaNonPublicMetrics {
	/**
	 * Number of times this video has been viewed
	 */
	viewCount: number;

	constructor(data: APIMediaNonPublicMetrics & APIMediaPublicMetrics) {
		super(data);

		this.viewCount = data.view_count;
	}
}

export class MediaOrganicMetrics extends MediaPublicNonPublicMetricsUnion {
	constructor(data: APIMediaOrganicMetrics) {
		super(data);
	}
}

export class MediaPromotedMetrics extends MediaPublicNonPublicMetricsUnion {
	constructor(data: APIMediaPromotedMetrics) {
		super(data);
	}
}
