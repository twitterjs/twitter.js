import { CustomError } from '../../errors/index.js';
import type { ClientCredentialsInterface } from '../../typings/Interfaces';
import type {
  APIPlaceGeo,
  APIPlaceGeoBoundingBox,
  APIPollOption,
  APITweetAttachments,
  APITweetGeo,
  APITweetGeoCoordinates,
  APITweetReferencedTweet,
  APITweetReferencedTweetType,
  APIUserPublicMetrics,
  DeleteTweetsLikeResponse,
  DeleteUsersBlockingResponse,
  DeleteUsersFollowingResponse,
  DeleteUsersMutingResponse,
  DeleteUsersRetweetsResponse,
  PostTweetsLikeResponse,
  PostUsersBlockingResponse,
  PostUsersFollowingResponse,
  PostUsersMutingResponse,
  PostUsersRetweetsResponse,
  PutTweetReplyHideUnhideResponse,
  Snowflake,
} from 'twitter-types';

/**
 * The class for storing data required for generating an API request
 */
export class RequestData<Q, B> {
  /**
   * The query for the request
   */
  query: Q;

  /**
   * The body of the request
   */
  body: B;

  /**
   * Whether the endpoint responds with a stream of data over persisent http connection
   */
  isStreaming?: boolean;

  constructor(query: Q, body: B, isStreaming?: boolean) {
    this.query = query;
    this.body = body;
    this.isStreaming = isStreaming;
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
  placeID: string;
  type: 'Point' | null;
  coordinates: TweetGeoCoordinates | null;

  constructor(data: APITweetGeo) {
    this.placeID = data.place_id;
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

  constructor(data: PostUsersFollowingResponse) {
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

  constructor(data: DeleteUsersFollowingResponse) {
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

  constructor(data: PostUsersBlockingResponse) {
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

  constructor(data: DeleteUsersBlockingResponse) {
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

  constructor(data: PostUsersMutingResponse) {
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

  constructor(data: DeleteUsersMutingResponse) {
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

  constructor(data: PostTweetsLikeResponse) {
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

  constructor(data: DeleteTweetsLikeResponse) {
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

  constructor(data: PutTweetReplyHideUnhideResponse) {
    this.hidden = data.data.hidden;
  }
}

/**
 * A class that represents the data returned when the authorized user retweets a target tweet
 */
export class RetweetResponse {
  retweeted: boolean;

  constructor(data: PostUsersRetweetsResponse) {
    this.retweeted = data.data.retweeted;
  }
}

/**
 * A class that represents the data returned when the authorized user removes retweet of a target tweet
 */
export class RemovedRetweetResponse {
  retweeted: boolean;

  constructor(data: DeleteUsersRetweetsResponse) {
    this.retweeted = data.data.retweeted;
  }
}

export class ClientCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  username: string;

  constructor(data: ClientCredentialsInterface) {
    this.#validate(data);
    this.consumerKey = data.consumerKey;
    this.consumerSecret = data.consumerSecret;
    this.accessToken = data.accessToken;
    this.accessTokenSecret = data.accessTokenSecret;
    this.username = data.username;
  }

  #validate({
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
    username,
  }: ClientCredentialsInterface): void {
    if (
      typeof consumerKey !== 'string' ||
      typeof consumerSecret !== 'string' ||
      typeof accessToken !== 'string' ||
      typeof accessTokenSecret !== 'string' ||
      typeof username !== 'string'
    ) {
      throw new CustomError('CREDENTIALS_NOT_STRING');
    }
  }
}
