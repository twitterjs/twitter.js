import BaseStructure from './BaseStructure.js';
import { TweetAttachments } from './misc/Misc.js';
import { TweetEntities } from './misc/TweetEntities.js';
import type Client from '../client/Client.js';
import type { APITweetObject, APITweetReferencedTweet, APITweetReplySettings } from 'twitter-types';
import {
  TweetNonPublicMetrics,
  TweetOrganicMetrics,
  TweetPromotedMetrics,
  TweetPublicMetrics,
} from './misc/TweetMetrics.js';

export default class SimplifiedTweet extends BaseStructure {
  /**
   * The unique identifier of the requested Tweet
   */
  id: string;

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
  authorID?: string;

  /**
   * Contains context annotations for the Tweet
   */
  contextAnnotations?: Array<any>; // TODO

  /**
   * The ID of the original Tweet of the conversation (which includes direct replies, replies of replies)
   */
  conversationID?: string;

  /**
   * The `ISO 8601` creation time of the Tweet
   */
  createdAt?: Date;

  /**
   * The entities which have been parsed out of the text of the Tweet
   */
  entities: TweetEntities | null;

  /**
   * The details about the location tagged by the user in the Tweet, if they specified one
   */
  geo?: any; // TODO

  /**
   * If the Tweet is a reply, this field will contain the original Tweet’s author ID.
   * This will not necessarily always be the user directly mentioned in the Tweet
   */
  inReplyToUserID?: string;

  /**
   * The language of the Tweet, if detected by Twitter. Returned as a `BCP47` language tag
   */
  lang?: string;

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
  possiblySensitive?: boolean;

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
  referencedTweets?: Array<APITweetReferencedTweet>;

  /**
   * Shows who can reply to the Tweet
   */
  replySettings?: APITweetReplySettings;

  /**
   * The name of the app the user Tweeted from
   */
  source?: string;

  /**
   * When present, contains withholding details for withheld content
   *
   * See https://help.twitter.com/en/rules-and-policies/tweet-withheld-by-country
   */
  withheld?: any; // TODO

  constructor(client: Client, data: APITweetObject) {
    super(client, data.id);

    this.id = data.id;
    this.text = data.text;
    this.attachments = data.attachments ? new TweetAttachments(data.attachments) : null;
    this.authorID = data.author_id;
    this.contextAnnotations = data.context_annotations;
    this.conversationID = data.conversation_id;
    this.createdAt = data.created_at;
    this.entities = data.entities ? new TweetEntities(data.entities) : null;
    this.geo = data.geo;
    this.inReplyToUserID = data.in_reply_to_user_id;
    this.lang = data.lang;
    this.nonPublicMetrics = data.non_public_metrics ? new TweetNonPublicMetrics(data.non_public_metrics) : null;
    this.organicMetrics = data.organic_metrics ? new TweetOrganicMetrics(data.organic_metrics) : null;
    this.possiblySensitive = data.possibly_sensitive;
    this.promotedMetrics = data.promoted_metrics ? new TweetPromotedMetrics(data.promoted_metrics) : null;
    this.publicMetrics = data.public_metrics ? new TweetPublicMetrics(data.public_metrics) : null;
    this.referencedTweets = data.referenced_tweets;
    this.replySettings = data.reply_settings;
    this.source = data.source;
    this.withheld = data.withheld;
  }
}
