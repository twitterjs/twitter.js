import { CustomError } from '../errors';
import type { Client } from '../client';
import type { POSTTweetsJSONBody } from 'twitter-types';
import type {
  TweetCreateGeoOptions,
  TweetCreateMediaOptions,
  TweetCreateOptions,
  TweetCreatePollOptions,
} from '../typings';

export class TweetPayload {
  options: TweetCreateOptions;

  client: Client;

  constructor(client: Client, options: TweetCreateOptions) {
    this.options = options;
    this.client = client;
  }

  resolveGeo(geoData?: TweetCreateGeoOptions): POSTTweetsJSONBody['geo'] | undefined {
    return geoData?.placeId ? { place_id: geoData.placeId } : undefined;
  }

  resolveMedia(mediaData?: TweetCreateMediaOptions): POSTTweetsJSONBody['media'] | undefined {
    const taggedUserIds = mediaData?.taggedUsers?.map(user => {
      const userId = this.client.users.resolveId(user);
      if (!userId) throw new CustomError('USER_RESOLVE_ID', 'tag in the media');
      return userId;
    });
    return mediaData ? { media_ids: mediaData.mediaIds, tagged_user_ids: taggedUserIds } : undefined;
  }

  resolvePoll(pollData?: TweetCreatePollOptions): POSTTweetsJSONBody['poll'] | undefined {
    return pollData ? { duration_minutes: pollData.durationMinutes, options: pollData.options } : undefined;
  }

  resolveReply(): POSTTweetsJSONBody['reply'] | undefined {
    const excludeUserIds = this.options?.excludeReplyUsers?.map(user => {
      const userId = this.client.users.resolveId(user);
      if (!userId) throw new CustomError('USER_RESOLVE_ID', 'exclude from the reply');
      return userId;
    });
    const inReplyToTweetId = this.options?.inReplyToTweet
      ? this.client.tweets.resolveId(this.options.inReplyToTweet) ?? undefined
      : undefined;

    return excludeUserIds || inReplyToTweetId
      ? { exclude_reply_user_ids: excludeUserIds, in_reply_to_tweet_id: inReplyToTweetId }
      : undefined;
  }

  resolveData(): POSTTweetsJSONBody {
    const text = this.options.text;

    const { quoteTweet } = this.options;
    const quote_tweet_id = quoteTweet ? this.client.tweets.resolveId(quoteTweet) ?? undefined : undefined;

    const data: POSTTweetsJSONBody = {
      text,
      direct_message_deep_link: this.options.directMessageDeepLink,
      for_super_followers_only: this.options.forSuperFollowersOnly,
      geo: this.resolveGeo(this.options.geo),
      media: this.resolveMedia(this.options.media),
      poll: this.resolvePoll(this.options.poll),
      quote_tweet_id,
      reply: this.resolveReply(),
      reply_settings: this.options.replySettings,
    };

    return data;
  }
}
