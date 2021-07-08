import BaseStructure from './BaseStructure.js';
import { TweetEntities } from './misc/TweetEntities.js';
import { TweetContextAnnotation } from './misc/TweetContextAnnotation.js';
import { TweetAttachments, TweetGeo, TweetReference } from './misc/Misc.js';
import {
  TweetNonPublicMetrics,
  TweetOrganicMetrics,
  TweetPromotedMetrics,
  TweetPublicMetrics,
} from './misc/TweetMetrics.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type {
  APITweetContextAnnotation,
  APITweetObject,
  APITweetReferencedTweet,
  APITweetReplySettings,
  Snowflake,
} from 'twitter-types';

/**
 * A simplified version of {@link Tweet} class
 */
export default class SimplifiedTweet<C extends ClientUnionType> extends BaseStructure<C> {
  /**
   * The unique identifier of the requested Tweet
   */
  id: Snowflake;

  /**
   * The actual `UTF-8` text of the Tweet
   */
  text: string;

  /**
   * The type of attachments (if any) present in the Tweet
   */
  attachments: TweetAttachments | null;

  /**
   * The unique identifier of the User who posted the Tweet
   */
  authorID: Snowflake | null;

  /**
   * Contains context annotations for the Tweet
   */
  contextAnnotations: Array<TweetContextAnnotation>;

  /**
   * The ID of the original Tweet of the conversation (which includes direct replies, replies of replies)
   */
  conversationID: Snowflake | null;

  /**
   * The `ISO 8601` creation time of the Tweet
   */
  createdAt: Date | null;

  /**
   * The entities which have been parsed out of the text of the Tweet
   */
  entities: TweetEntities | null;

  /**
   * The details about the location tagged by the user in the Tweet, if they specified one
   */
  geo: TweetGeo | null;

  /**
   * If the Tweet is a reply, this field will contain the original Tweet’s author ID.
   * This will not necessarily always be the user directly mentioned in the Tweet
   */
  inReplyToUserID: Snowflake | null;

  /**
   * The language of the Tweet, if detected by Twitter. Returned as a `BCP47` language tag
   */
  lang: string | null;

  /**
   * Non-public engagement metrics for the Tweet at the time of the request.
   * Requires user context authentication
   */
  nonPublicMetrics: TweetNonPublicMetrics | null;

  /**
   * Engagement metrics tracked in an organic context for the Tweet at the time of the request.
   * Requires user context authentication
   */
  organicMetrics: TweetOrganicMetrics | null;

  /**
   * This field only surfaces when a Tweet contains a link. The meaning of the field doesn’t pertain
   * to the Tweet content itself, but instead it is an indicator that the URL contained in the Tweet
   * may contain content or media identified as sensitive content
   */
  possiblySensitive: boolean | null;

  /**
   * Engagement metrics tracked in a promoted context for the Tweet at the time of the request.
   * Requires user context authentication
   */
  promotedMetrics: TweetPromotedMetrics | null;

  /**
   * Public engagement metrics for the Tweet at the time of the request
   */
  publicMetrics: TweetPublicMetrics | null;

  /**
   * A list of Tweets this Tweet refers to. It will also include the related Tweet referenced to by its parent
   */
  referencedTweets: Array<TweetReference>;

  /**
   * Shows who can reply to the Tweet
   */
  replySettings: APITweetReplySettings | null;

  /**
   * The name of the app the user Tweeted from
   */
  source: string | null;

  /**
   * When present, contains withholding details for withheld content
   *
   * See https://help.twitter.com/en/rules-and-policies/tweet-withheld-by-country
   */
  withheld?: any; // TODO

  constructor(client: ClientInUse<C>, data: APITweetObject) {
    super(client);

    this.id = data.id;
    this.text = data.text;
    this.attachments = data.attachments ? new TweetAttachments(data.attachments) : null;
    this.authorID = data.author_id ?? null;
    this.contextAnnotations = this.#patchTweetContextAnnotations(data.context_annotations);
    this.conversationID = data.conversation_id ?? null;
    this.createdAt = data.created_at ?? null;
    this.entities = data.entities ? new TweetEntities(data.entities) : null;
    this.geo = data.geo ? new TweetGeo(data.geo) : null;
    this.inReplyToUserID = data.in_reply_to_user_id ?? null;
    this.lang = data.lang ?? null;
    this.nonPublicMetrics = data.non_public_metrics ? new TweetNonPublicMetrics(data.non_public_metrics) : null;
    this.organicMetrics = data.organic_metrics ? new TweetOrganicMetrics(data.organic_metrics) : null;
    this.possiblySensitive = data.possibly_sensitive ?? null;
    this.promotedMetrics = data.promoted_metrics ? new TweetPromotedMetrics(data.promoted_metrics) : null;
    this.publicMetrics = data.public_metrics ? new TweetPublicMetrics(data.public_metrics) : null;
    this.referencedTweets = this.#patchReferencedTweets(data.referenced_tweets);
    this.replySettings = data.reply_settings ?? null;
    this.source = data.source ?? null;
    this.withheld = data.withheld;
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  /**
   * Converts raw tweet references data into desired shape to patch {@link SimplifiedTweet.referencedTweets} property
   * @param rawTweetReferences The raw data for tweet references
   * @returns An array of {@link TweetReference} objects
   */
  #patchReferencedTweets(rawTweetReferences?: Array<APITweetReferencedTweet>): Array<TweetReference> {
    const tweetReferencesArray: Array<TweetReference> = [];
    if (!rawTweetReferences) return tweetReferencesArray;
    for (const rawTweetReference of rawTweetReferences) {
      const tweetReference = new TweetReference(rawTweetReference);
      tweetReferencesArray.push(tweetReference);
    }
    return tweetReferencesArray;
  }

  #patchTweetContextAnnotations(
    rawContextAnnotations?: Array<APITweetContextAnnotation>,
  ): Array<TweetContextAnnotation> {
    const tweetContextAnnotationsArray: Array<TweetContextAnnotation> = [];
    if (!rawContextAnnotations) return tweetContextAnnotationsArray;
    for (const rawContextAnnotation of rawContextAnnotations) {
      const contextAnnotation = new TweetContextAnnotation(rawContextAnnotation);
      tweetContextAnnotationsArray.push(contextAnnotation);
    }
    return tweetContextAnnotationsArray;
  }
}
