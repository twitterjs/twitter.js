import type {
  APITweetAttachments,
  APITweetGeo,
  APITweetGeoCoordinates,
  APITweetReferencedTweet,
  APITweetReferencedTweetType,
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
   * Whether the requested endpoint require user context authorization
   */
  requireUserContextAuth: boolean;

  constructor(query: Q, body: B, requireUserContextAuth: boolean) {
    this.query = query;
    this.body = body;
    this.requireUserContextAuth = requireUserContextAuth;
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
  id: string;

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
