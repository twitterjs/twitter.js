import type User from '../structures/User.js';
import type Tweet from '../structures/Tweet.js';
import type Collection from '../util/Collection.js';
import type SimplifiedUser from '../structures/SimplifiedUser.js';
import type SimplifiedTweet from '../structures/SimplifiedTweet.js';
import type { FetchTweetOptions, FetchTweetsOptions } from './Interfaces.js';

export type PlaceField =
  | 'contained_within'
  | 'country'
  | 'country_code'
  | 'full_name'
  | 'geo'
  | 'id'
  | 'name'
  | 'place_type';

export type PollField = 'duration_minutes' | 'end_datetime' | 'id' | 'options' | 'voting_status';

export type MediaField =
  | 'duration_ms'
  | 'height'
  | 'media_key'
  | 'preview_image_url'
  | 'type'
  | 'url'
  | 'width'
  | 'public_metrics'
  | 'organic_metrics';

export type UserExpansion = 'pinned_tweet_id';

export type UserField =
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

export type UserResolvable = User | SimplifiedUser | string;

export type TweetExpansion =
  | 'attachments.poll_ids'
  | 'attachments.media_keys'
  | 'author_id'
  | 'entities.mentions.username'
  | 'geo.place_id'
  | 'in_reply_to_user_id'
  | 'referenced_tweets.id'
  | 'referenced_tweets.id.author_id';

export type TweetField =
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

export type TweetManagerFetchResult<T extends FetchTweetOptions | FetchTweetsOptions> = T extends FetchTweetOptions
  ? Tweet
  : Collection<string, Tweet>;

export type TweetResolvable = Tweet | SimplifiedTweet | string;
