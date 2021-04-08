/**
 * Options for a client
 * @typedef {Object} ClientOptions
 * @type {HTTPOptions} [http] HTTP options
 */
export const DefaultClientOptions = {
  /**
   * HTTP options
   * @typedef {Object} HTTPOptions
   * @type {number} [version=2] The API version to use
   * @type {string} [api='https://api.twitter.com'] The base url of the API
   */
  http: {
    version: 2,
    api: 'https://api.twitter.com',
  },
};

// Query parameters for url path
export const queryParameters = {
  userFields: [
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
  ],
  tweetFields: [
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
  ],
  mediaFields: ['duration_ms', 'height', 'media_key', 'preview_image_url', 'type', 'url', 'width', 'public_metrics'],
  placeFields: ['contained_within', 'country', 'country_code', 'full_name', 'geo', 'id', 'name', 'place_type'],
  pollFields: ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status'],
  expansions: {
    tweet: [
      'attachments.poll_ids',
      'attachments.media_keys',
      'author_id',
      'entities.mentions.username',
      'geo.place_id',
      'in_reply_to_user_id',
      'referenced_tweets.id',
      'referenced_tweets.id.author_id',
    ],
    user: ['pinned_tweet_id'],
  },
};

// client events
export const Events = {
  READY: 'ready',
};

// HTTPverbs or Request Methods
export const HTTPverbs = {
  GET: 'GET',
  PUT: 'PUT',
};

// query
export const queryTypes = {
  ID: 'id',
  USERNAME: 'username',
};
