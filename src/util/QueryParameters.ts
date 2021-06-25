import {
  MediaFields,
  PlaceFields,
  PollFields,
  TweetExpansions,
  TweetFields,
  UserExpansions,
  UserFields,
} from '../typings/index.js';

export const userFields: Array<UserFields> = [
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
  'username',
  'verified',
  'withheld',
];

export const tweetFields: Array<TweetFields> = [
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

export const mediaFields: Array<MediaFields> = [
  'duration_ms',
  'height',
  'media_key',
  'preview_image_url',
  'type',
  //'url',
  'width',
  'public_metrics',
];

export const placeFields: Array<PlaceFields> = [
  'contained_within',
  'country',
  'country_code',
  'full_name',
  'geo',
  'id',
  'name',
  'place_type',
];

export const pollFields: Array<PollFields> = ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status'];

export const tweetExpansions: Array<TweetExpansions> = [
  'attachments.poll_ids',
  'attachments.media_keys',
  'author_id',
  'entities.mentions.username',
  'geo.place_id',
  'in_reply_to_user_id',
  'referenced_tweets.id',
  'referenced_tweets.id.author_id',
];

export const userExpansions: Array<UserExpansions> = ['pinned_tweet_id'];
