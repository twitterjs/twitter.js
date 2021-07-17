import type {
  MediaFieldsParameter,
  PlaceFieldsParameter,
  PollFieldsParameter,
  TweetExpansionsParameter,
  TweetFieldsParameter,
  UserExpansionsParameter,
  UserFieldsParameter,
} from 'twitter-types';

export const UserFields: Array<UserFieldsParameter> = [
  'created_at',
  'description',
  'entities',
  'id',
  'location',
  'name',
  'pinned_tweet_id',
  'profile_image_url',
  'protected',
  'public_metrics',
  'url',
  'username',
  'verified',
  'withheld',
];

export const TweetFields: Array<TweetFieldsParameter> = [
  'attachments',
  'author_id',
  'context_annotations',
  'conversation_id',
  'created_at',
  'entities',
  'geo',
  'id',
  'in_reply_to_user_id',
  'lang',
  'public_metrics',
  'possibly_sensitive',
  'referenced_tweets',
  'reply_settings',
  'source',
  'text',
  'withheld',
];

export const MediaFields: Array<MediaFieldsParameter> = [
  'duration_ms',
  'height',
  'media_key',
  'preview_image_url',
  'type',
  'url',
  'width',
  'public_metrics',
  'organic_metrics',
];

export const PlaceFields: Array<PlaceFieldsParameter> = [
  'contained_within',
  'country',
  'country_code',
  'full_name',
  'geo',
  'id',
  'name',
  'place_type',
];

export const PollFields: Array<PollFieldsParameter> = [
  'duration_minutes',
  'end_datetime',
  'id',
  'options',
  'voting_status',
];

export const TweetExpansions: Array<TweetExpansionsParameter> = [
  'attachments.poll_ids',
  'attachments.media_keys',
  'author_id',
  'entities.mentions.username',
  'geo.place_id',
  'in_reply_to_user_id',
  'referenced_tweets.id',
  'referenced_tweets.id.author_id',
];

export const UserExpansions: Array<UserExpansionsParameter> = ['pinned_tweet_id'];
