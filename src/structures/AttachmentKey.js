/**
 * Holds keys for attachments in a tweet
 */
class AttachmentKey {
  /**
   * @param {Object} data
   */
  constructor(data) {
    /**
     * An array of media keys for media present in the tweet
     * @type {?Array<string>}
     */
    this.mediaKeys = data?.media_keys ? this._patchMediaKeys(data.media_keys) : null;

    /**
     * An array of IDs for polls present in the tweet
     * @type {?Array<string>}
     */
    this.pollIds = null;
  }

  /**
   * Adds data to the mediaKeys
   * @param {Array<string>} mediaKeys
   * @private
   * @returns {Array<string>}
   */
  _patchMediaKeys(mediaKeys) {
    const mediaKeysArray = [];
    mediaKeys.forEach(mediaKey => {
      mediaKeysArray.push(mediaKey);
    });
    return mediaKeysArray;
  }

  /**
   * Adds data to the pollIds
   * @param {Array<string>} pollIds
   * @private
   * @returns {Array<string>}
   */
  _patchPollIds(pollIds) {
    const pollIdsArray = [];
    pollIds.forEach(pollId => {
      pollIdsArray.push(pollId);
    });
    return pollIdsArray;
  }
}

export default AttachmentKey;
