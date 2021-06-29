import type Tweet from '../structures/Tweet.js';

export type PlaceFields =
  | 'contained_within'
  | 'country'
  | 'country_code'
  | 'full_name'
  | 'geo'
  | 'id'
  | 'name'
  | 'place_type';

export type PollFields = 'duration_minutes' | 'end_datetime' | 'id' | 'options' | 'voting_status';

export type MediaFields =
  | 'duration_ms'
  | 'height'
  | 'media_key'
  | 'preview_image_url'
  | 'type'
  | 'url'
  | 'width'
  | 'public_metrics'
  | 'organic_metrics';

export type UserExpansions = 'pinned_tweet_id';

export type UserFields =
  | 'created_at'
  | 'description'
  | 'entities'
  | 'id'
  | 'location'
  | 'name'
  | 'pinned_tweet_id'
  | 'profile_image_url'
  | 'protected'
  | 'public_metrics'
  | 'url'
  | 'username'
  | 'verified'
  | 'withheld';

export type TweetExpansions =
  | 'attachments.poll_ids'
  | 'attachments.media_keys'
  | 'author_id'
  | 'entities.mentions.username'
  | 'geo.place_id'
  | 'in_reply_to_user_id'
  | 'referenced_tweets.id'
  | 'referenced_tweets.id.author_id';

export type TweetFields =
  | 'attachments'
  | 'author_id'
  | 'context_annotations'
  | 'conversation_id'
  | 'created_at'
  | 'entities'
  | 'geo'
  | 'id'
  | 'in_reply_to_user_id'
  | 'lang'
  | 'public_metrics'
  | 'possibly_sensitive'
  | 'referenced_tweets'
  | 'reply_settings'
  | 'source'
  | 'text'
  | 'withheld';

export type TweetResolvable = string | Tweet;
