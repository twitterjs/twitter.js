import type { ClientOptions } from '../typings';
import type {
  APIMediaFieldsParameter,
  APIPlaceFieldsParameter,
  APIPollFieldsParameter,
  APISpaceExpansionsParameter,
  APISpaceFieldsParameter,
  APITweetExpansionsParameter,
  APITweetFieldsParameter,
  APIUserExpansionsParameter,
  APIUserFieldsParameter,
} from 'twitter-types';

export const UserFields: Array<APIUserFieldsParameter> = [
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

export const TweetFields: Array<APITweetFieldsParameter> = [
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

export const SpaceFields: Array<APISpaceFieldsParameter> = [
  'created_at',
  'creator_id',
  'host_ids',
  'id',
  'invited_user_ids',
  'is_ticketed',
  'lang',
  'participant_count',
  'scheduled_start',
  'speaker_ids',
  'started_at',
  'state',
  'title',
  'updated_at',
];

export const MediaFields: Array<APIMediaFieldsParameter> = [
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

export const PlaceFields: Array<APIPlaceFieldsParameter> = [
  'contained_within',
  'country',
  'country_code',
  'full_name',
  'geo',
  'id',
  'name',
  'place_type',
];

export const PollFields: Array<APIPollFieldsParameter> = [
  'duration_minutes',
  'end_datetime',
  'id',
  'options',
  'voting_status',
];

export const TweetExpansions: Array<APITweetExpansionsParameter> = [
  'attachments.poll_ids',
  'attachments.media_keys',
  'author_id',
  'entities.mentions.username',
  'geo.place_id',
  'in_reply_to_user_id',
  'referenced_tweets.id',
  'referenced_tweets.id.author_id',
];

export const UserExpansions: Array<APIUserExpansionsParameter> = ['pinned_tweet_id'];

export const SpaceExpansions: Array<APISpaceExpansionsParameter> = [
  'creator_id',
  'host_ids',
  'invited_user_ids',
  'speaker_ids',
];

export const ClientEvents = {
  FILTERED_TWEET_CREATE: 'filteredTweetCreate',
  KEEP_ALIVE_SIGNAL: 'keepAliveSignal',
  PARTIAL_ERROR: 'partialError',
  READY: 'ready',
  SAMPLED_TWEET_CREATE: 'sampledTweetCreate',
};

/**
 * The default options which the client gets initialized with
 */
export const defaultClientOptions: ClientOptions = {
  /**
   * The options for the API to use
   */
  api: {
    version: 2,
    baseURL: 'https://api.twitter.com',
  },

  /**
   * The parameters to pass in the query of a request
   */
  queryParameters: {
    userFields: UserFields,
    tweetFields: TweetFields,
    spaceFields: SpaceFields,
    mediaFields: MediaFields,
    placeFields: PlaceFields,
    pollFields: PollFields,
    tweetExpansions: TweetExpansions,
    userExpansions: UserExpansions,
    spaceExpansions: SpaceExpansions,
  },

  /**
   * The events that the client opted-in for
   */
  events: [],
};

export const StreamType = {
  SAMPLED: 'sampled',
  FILTERED: 'filtered',
};
