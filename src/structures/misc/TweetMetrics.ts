import {
  APITweetNonPublicMetrics,
  APITweetOrganicMetrics,
  APITweetPromotedMetrics,
  APITweetPublicMetrics,
} from 'twitter-types';

export class TweetNonPublicMetrics {
  impressionCount: number;
  urlLinkClicks: number | null;
  userProfileClicks: number;

  constructor(data: APITweetNonPublicMetrics) {
    this.impressionCount = data.impression_count;
    this.urlLinkClicks = data.url_link_clicks ?? null;
    this.userProfileClicks = data.user_profile_clicks;
  }
}

export class TweetOrganicMetrics extends TweetNonPublicMetrics {
  likeCount: number;
  replyCount: number;
  retweetCount: number;

  constructor(data: APITweetOrganicMetrics) {
    super(data);

    this.likeCount = data.like_count;
    this.replyCount = data.reply_count;
    this.retweetCount = data.retweet_count;
  }
}

export class TweetPromotedMetrics extends TweetOrganicMetrics {
  constructor(data: APITweetPromotedMetrics) {
    super(data);
  }
}

export class TweetPublicMetrics {
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;

  constructor(data: APITweetPublicMetrics) {
    this.retweetCount = data.retweet_count;
    this.replyCount = data.reply_count;
    this.likeCount = data.like_count;
    this.quoteCount = data.quote_count;
  }
}
