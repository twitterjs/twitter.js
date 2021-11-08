import { PostTweetCreateJSONBody } from 'twitter-types';
import type {
  TweetCreateGeoOptions,
  TweetCreateMediaOptions,
  TweetCreateOptions,
  TweetCreatePollOptions,
  TweetCreateReplyOptions,
} from '../typings';

export class TweetPayload {
  options: TweetCreateOptions;

  constructor(options: TweetCreateOptions) {
    this.options = options;
  }

  resolveGeo(geoData?: TweetCreateGeoOptions): any {
    return geoData?.placeId ? { place_id: geoData.placeId } : undefined;
  }

  resolveMedia(mediaData?: TweetCreateMediaOptions): any {
    return mediaData ? { media_ids: mediaData.mediaIds, tagged_user_ids: mediaData.taggedUserIds } : undefined;
  }

  resolvePoll(pollData?: TweetCreatePollOptions): any {
    return pollData ? { duration_minutes: pollData.durationMinutes, options: pollData.options } : undefined;
  }

  resolveReply(replyData?: TweetCreateReplyOptions): any {
    return replyData
      ? { exclude_reply_user_ids: replyData.excludeReplyUserIds, in_reply_to_tweet_id: replyData.inReplyToTweetId }
      : undefined;
  }

  resolveData(): PostTweetCreateJSONBody {
    const data: PostTweetCreateJSONBody = {
      text: this.options.text,
      direct_message_deep_link: this.options.directMessageDeepLink,
      for_super_followers_only: this.options.forSuperFollowersOnly,
      geo: this.resolveGeo(this.options.geo),
      media: this.resolveMedia(this.options.media),
      poll: this.resolvePoll(this.options.poll),
      quote_tweet_id: this.options.quoteTweetId,
      reply: this.resolveReply(this.options.reply),
      reply_settings: this.options.reply?.replySettings,
    };

    return data;
  }
}
