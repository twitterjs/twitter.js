'use strict';

// endpoints
export const baseEndpoint = 'https://api.twitter.com/2/';

export const tweetById = `${baseEndpoint}tweets/`;

export const tweetsByIds = `${baseEndpoint}tweets`;

export const userById = `${baseEndpoint}users/`;

export const userByUsername = `${baseEndpoint}users/by/username/`;

export const usersByIds = `${baseEndpoint}users`;

export const usersByUsernames = `${baseEndpoint}users/by`;

// endpoint fields
export const userFields =
  'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld';

export const tweetFields =
  'attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,public_metrics,possibly_sensitive,referenced_tweets,reply_settings,source,text,withheld';

export const mediaFields = 'duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics';

export const placeFields = 'contained_within,country,country_code,full_name,geo,id,name,place_type';

export const pollFields = 'duration_minutes,end_datetime,id,options,voting_status';

// endpoint expansions
export const expansionsForTweet =
  'attachments.poll_ids,attachments.media_keys,author_id,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id';

export const expansionsForUser = 'pinned_tweet_id';

// client events
export const Events = {
  READY: 'ready',
};

// HTTPverbs or Request Methods
export const HTTPverbs = {
  GET: 'GET',
};

// query
export const queryTypes = {
  ID: 'id',
  USERNAME: 'username',
};
