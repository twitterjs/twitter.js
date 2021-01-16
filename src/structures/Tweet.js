'use strict';

import AttachmentKey from './AttachmentKey.js';
import BaseStructure from './BaseStructure.js';
import ContextAnnotation from './ContextAnnotation.js';
import TweetEntity from './TweetEntity.js';
import TweetPublicMetrics from './TweetPublicMetrics.js';

/**
 * A tweet on Twitter
 * @extends BaseStructure
 */
class Tweet extends BaseStructure {
  /**
   * @param {Client} client The client that instantiated this class
   * @param {Object} data The data for the Tweet
   */
  constructor(client, data) {
    super(client);

    /**
     * The client that instantiated this class
     * @type {Client}
     */

    /**
     * The id of the tweet
     * @type {string}
     */
    this.id = data.id;

    /**
     * The content of the tweet
     * @type {string}
     */
    this.text = data.text;

    /**
     * The attachments in the tweet
     */
    this.attachments = null;

    /**
     * Keys of the attachments in the tweet
     */
    this.attachmentKeys = data?.attachments ? new AttachmentKey(data.attachments) : null;

    /**
     * The author of the tweet
     * @type {?User}
     */
    this.author = null;

    /**
     * The id of the author of the tweet
     * @type {string}
     */
    this.authorID = data.author_id;

    /**
     * Context annotations for the tweet
     * @type {ContextAnnotation}
     */
    this.contextAnnotations = data?.context_annotations
      ? this._patchContextAnnotations(data.context_annotations)
      : null;

    /**
     * Id of the original tweet of the conversation
     * @type {?string}
     */
    this.conversationID = data.conversation_id ? data.conversation_id : null;

    /**
     * Time at which the tweet was created at
     * @type {Date}
     */
    this.createdAt = data.created_at;

    /**
     * The entities parsed out of the tweet's text
     */
    this.entities = data?.entities ? this._patchEntities(data.entities) : null;

    /**
     * Location tagged by the user in the tweet
     */
    this.geo = null;

    /**
     * Original tweet's author ID, if the tweet is a reply
     * @type {?string}
     */
    this.replyTo = data.in_reply_to_user_id ? data.in_reply_to_user_id : null;

    /**
     * The language of the tweet
     * @type {string}
     */
    this.language = data.lang;

    /**
     * Whether the tweet contains links to some sensitive content
     * @type {?boolean}
     */
    this.possiblySensitive = data.possibly_sensitive ? data.possibly_sensitive : null;

    /**
     * The public metrics of the tweet
     */
    this.publicMetrics = data?.public_metrics ? this._patchPublicMetrics(data.public_metrics) : null;

    /**
     * Tweets this tweet refers to
     */
    this.referencedTweets = null;

    /**
     * Shows who can reply to the tweet
     * @type {string}
     */
    this.canReply = data.reply_settings;

    /**
     * The platform used to post the tweet
     * @type {string}
     */
    this.source = data.source;

    /**
     * The withholding details for the tweet if it is withheld
     */
    this.withheld = null;
  }

  _patchPublicMetrics(publicMetrics) {
    return new TweetPublicMetrics(publicMetrics);
  }

  /**
   * Adds data to the entities property
   * @param {Object} entities
   * @private
   * @returns {TweetEntity}
   */
  _patchEntities(entities) {
    return new TweetEntity(entities);
  }

  /**
   * Adds data to the contextAnnotations
   * @param {Array<Object>} contextAnnotations
   * @private
   * @returns {Array<ContextAnnotation>}
   */
  _patchContextAnnotations(contextAnnotations) {
    const contextAnnotationsArray = [];
    contextAnnotations.forEach(contextAnnotation => {
      contextAnnotationsArray.push(new ContextAnnotation(contextAnnotation));
    });
    return contextAnnotationsArray;
  }
}

export default Tweet;
