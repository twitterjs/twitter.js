'use strict';

/**
 * Represents medias like image, video, and gif in a tweet
 */
class Media {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * A unique identifier of the media
     * @type {string}
     */
    this.mediaKey = data.media_key;

    /**
     * Type of the media
     * @type {string}
     */
    this.type = data.type;

    /**
     * The duration of the media in ms if the media type is video
     * @type {?number}
     */
    this.duration = data.duration_ms ? data.duration_ms : null;

    /**
     * The height of the media in pixels
     * @type {number}
     */
    this.height = data.height;

    /**
     * The URL to the static placeholder preview of this content
     * @type {string}
     */
    this.previewImageURL = data.preview_image_url;

    /**
     * The public metrics of the media
     * @type {?Object}
     */
    this.publicMetrics = null;

    /**
     * The width of the media in pixels
     * @type {number}
     */
    this.width = data.width;
  }
}

export default Media;
