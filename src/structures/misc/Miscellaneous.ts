import { CustomError } from '../../errors';
import type { ClientCredentialsInterface, RequestDataOptions } from '../../typings';
import type {
  APIPlaceGeo,
  APIPlaceGeoBoundingBox,
  APIPollOption,
  APITweetAttachments,
  APITweetGeo,
  APITweetGeoCoordinates,
  APITweetReferencedTweet,
  APITweetReferencedTweetType,
  APITweetWithheld,
  APIUserPublicMetrics,
  APIUserWithheld,
  DELETE_2_users_id_likes_tweet_id_Response,
  DELETE_2_users_id_retweets_source_tweet_id_Response,
  DELETE_2_users_source_user_id_blocking_target_user_id_Response,
  DELETE_2_users_source_user_id_following_target_user_id_Response,
  DELETE_2_users_source_user_id_muting_target_user_id_Response,
  GET_2_tweets_counts_recent_Query,
  GET_2_tweets_counts_recent_Response,
  POST_2_users_id_blocking_Response,
  POST_2_users_id_following_Response,
  POST_2_users_id_likes_Response,
  POST_2_users_id_muting_Response,
  POST_2_users_id_retweets_Response,
  PUT_2_tweets_id_hidden_Response,
  Snowflake,
} from 'twitter-types';

/**
 * The class for storing data required for generating an API request
 */
export class RequestData<Q = undefined, B = undefined> {
  /**
   * The query for the request
   */
  query?: Q;

  /**
   * The body of the request
   */
  body?: B;

  /**
   * Whether the endpoint responds with a stream of data over persisent http connection
   */
  isStreaming?: boolean;

  /**
   * Whether the endpoint need user context authorization
   */
  isUserContext?: boolean;

  constructor(data: RequestDataOptions<Q, B>) {
    this.query = data.query;
    this.body = data.body;
    this.isStreaming = data.isStreaming;
    this.isUserContext = data.isUserContext;
  }
}

export class TweetAttachments {
  mediaKeys: Array<string>;
  pollIds: Array<string>;

  constructor(data: APITweetAttachments) {
    this.mediaKeys = data.media_keys ?? [];
    this.pollIds = data.poll_ids ?? [];
  }
}

export class TweetReference {
  /**
   * The relation between this tweet and the referenced tweet
   */
  type: APITweetReferencedTweetType;

  /**
   * The ID of the referenced tweet
   */
  id: Snowflake;

  constructor(data: APITweetReferencedTweet) {
    this.type = data.type;
    this.id = data.id;
  }
}

export class TweetGeo {
  placeId: string;
  type: 'Point' | null;
  coordinates: TweetGeoCoordinates | null;

  constructor(data: APITweetGeo) {
    this.placeId = data.place_id;
    this.type = data.coordinates?.type ?? null;
    this.coordinates = data.coordinates ? new TweetGeoCoordinates(data.coordinates) : null;
  }
}

export class TweetGeoCoordinates {
  latitude: number | null;
  longitude: number | null;

  constructor(data: APITweetGeoCoordinates) {
    this.latitude = data.coordinates?.[0] ?? null;
    this.longitude = data.coordinates?.[1] ?? null;
  }
}

export class UserPublicMetrics {
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  listedCount: number;

  constructor(data: APIUserPublicMetrics) {
    this.followersCount = data.followers_count;
    this.followingCount = data.following_count;
    this.tweetCount = data.tweet_count;
    this.listedCount = data.listed_count;
  }
}

export class PollOption {
  position: number;
  label: string;
  votes: number;

  constructor(data: APIPollOption) {
    this.position = data.position;
    this.label = data.label;
    this.votes = data.votes;
  }
}

export class PlaceGeo {
  type: string;
  bbox: APIPlaceGeoBoundingBox;
  properties: Record<string, unknown>;

  constructor(data: APIPlaceGeo) {
    this.type = data.type;
    this.bbox = data.bbox;
    this.properties = data.properties;
  }
}

/**
 * A class that represents the data returned when the authorized user follows a target user
 */
export class UserFollowResponse {
  /**
   * Whether the authorized user is following the target user
   */
  following: boolean;

  /**
   * Whether the follow request of authorized user is yet to be approved by the target user
   */
  pendingFollow: boolean;

  constructor(data: POST_2_users_id_following_Response) {
    this.following = data.data.following;
    this.pendingFollow = data.data.pending_follow;
  }
}

/**
 * A class that represents the data returned when the authorized user unfollows a target user
 */
export class UserUnfollowResponse {
  /**
   * Whether the authorized user is following the target user
   */
  following: boolean;

  constructor(data: DELETE_2_users_source_user_id_following_target_user_id_Response) {
    this.following = data.data.following;
  }
}

/**
 * A class that represents the data returned when the authorized user blocks a target user
 */
export class UserBlockResponse {
  /**
   * Whether the authorized user is blocking the target user
   */
  blocking: boolean;

  constructor(data: POST_2_users_id_blocking_Response) {
    this.blocking = data.data.blocking;
  }
}

/**
 * A class that represents the data returned when the authorized user unblocks a target user
 */
export class UserUnblockResponse {
  /**
   * Whether the authorized user is blocking the target user
   */
  blocking: boolean;

  constructor(data: DELETE_2_users_source_user_id_blocking_target_user_id_Response) {
    this.blocking = data.data.blocking;
  }
}

/**
 * A class that represents the data returned when the authorized user mutes a target user
 */
export class UserMuteResponse {
  /**
   * Whether the authorized user is muting the target user
   */
  muting: boolean;

  constructor(data: POST_2_users_id_muting_Response) {
    this.muting = data.data.muting;
  }
}

/**
 * A class that represents the data returned when the authorized user unmutes a target user
 */
export class UserUnmuteResponse {
  /**
   * Whether the authorized user is muting the target user
   */
  muting: boolean;

  constructor(data: DELETE_2_users_source_user_id_muting_target_user_id_Response) {
    this.muting = data.data.muting;
  }
}

/**
 * A class that represents the data returned when the authorized user likes a target tweet
 */
export class TweetLikeResponse {
  /**
   * Whether the authorized user is liking the target tweet
   */
  liked: boolean;

  constructor(data: POST_2_users_id_likes_Response) {
    this.liked = data.data.liked;
  }
}

/**
 * A class that represents the data returned when the authorized user unlikes a target tweet
 */
export class TweetUnlikeResponse {
  /**
   * Whether the authorized user is liking the target tweet
   */
  liked: boolean;

  constructor(data: DELETE_2_users_id_likes_tweet_id_Response) {
    this.liked = data.data.liked;
  }
}

/**
 * A class that represents the data returned when the authorized user hides or unhides a target tweet reply
 */
export class TweetReplyHideUnhideResponse {
  /**
   * Whether the target tweet reply is hidden
   */
  hidden: boolean;

  constructor(data: PUT_2_tweets_id_hidden_Response) {
    this.hidden = data.data.hidden;
  }
}

/**
 * A class that represents the data returned when the authorized user retweets a target tweet
 */
export class RetweetResponse {
  retweeted: boolean;

  constructor(data: POST_2_users_id_retweets_Response) {
    this.retweeted = data.data.retweeted;
  }
}

/**
 * A class that represents the data returned when the authorized user removes retweet of a target tweet
 */
export class RemovedRetweetResponse {
  retweeted: boolean;

  constructor(data: DELETE_2_users_id_retweets_source_tweet_id_Response) {
    this.retweeted = data.data.retweeted;
  }
}

export class ClientCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;

  constructor(data: ClientCredentialsInterface) {
    this.#validate(data);
    this.consumerKey = data.consumerKey;
    this.consumerSecret = data.consumerSecret;
    this.accessToken = data.accessToken;
    this.accessTokenSecret = data.accessTokenSecret;
    this.bearerToken = data.bearerToken;
  }

  #validate({
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
    bearerToken,
  }: ClientCredentialsInterface): void {
    if (
      typeof consumerKey !== 'string' ||
      typeof consumerSecret !== 'string' ||
      typeof accessToken !== 'string' ||
      typeof accessTokenSecret !== 'string' ||
      typeof bearerToken !== 'string'
    ) {
      throw new CustomError('CREDENTIALS_NOT_STRING');
    }
  }
}

export class TweetCountBucket {
  /**
   * The start time of the bucket
   */
  start: Date;

  /**
   * The end time of the bucket
   */
  end: Date;

  /**
   * The number of tweets created between start and end time that matched with the query
   */
  count: number;

  /**
   * The timespan between start and end time of this bucket
   */
  granularity: GET_2_tweets_counts_recent_Query['granularity'];

  constructor(
    data: GET_2_tweets_counts_recent_Response['data'][0],
    granularity: GET_2_tweets_counts_recent_Query['granularity'] | null,
  ) {
    this.start = new Date(data.start);
    this.end = new Date(data.end);
    this.count = data.tweet_count;
    this.granularity = granularity ?? 'hour';
  }
}

/**
 * Represents withholding details about a user
 */
export class UserWitheld {
  /**
   * A list of countries where this content is not available
   */
  countryCodes: Array<string>;

  /**
   * The type of content being withheld
   */
  scope: string | null;

  constructor(data: APIUserWithheld) {
    this.countryCodes = data.country_codes;
    this.scope = data.scope ?? null;
  }
}

/**
 * Represents withholding details about a tweet
 */
export class TweetWithheld extends UserWitheld {
  /**
   * Whether the content is being withheld on the basis of copyright infringement
   */
  copyright: boolean;

  constructor(data: APITweetWithheld) {
    super(data);
    this.copyright = data.copyright;
  }
}

/**
 * The rule that matched against the filtered tweet
 */
export class MatchingRule {
  /**
   * The id of the filter rule
   */
  id: Snowflake;

  /**
   * The tag of the filter rule
   */
  tag: string | null;

  constructor(data: { id: Snowflake; tag?: string }) {
    this.id = data.id;
    this.tag = typeof data.tag === 'string' ? (data.tag.length > 0 ? data.tag : null) : null;
  }
}
