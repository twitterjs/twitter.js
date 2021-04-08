import Media from './Media.js';
import Poll from './Poll.js';

/**
 * Holds attachments like media and poll in a tweet
 */
class Attachment {
  constructor(data) {
    /**
     * The poll present in the tweet
     * @type {Poll}
     */
    this.polls = data?.polls ? this._patchPoll(data.polls) : null;

    /**
     * The media present in the tweet
     * @type {Media}
     */
    this.media = data?.media ? this._patchMedia(data.media) : null;
  }

  _patchPoll(polls) {
    const pollsArray = [];
    polls.forEach(poll => {
      pollsArray.push(new Poll(poll));
    });
    return pollsArray;
  }

  _patchMedia(media) {
    const mediaArray = [];
    media.forEach(media => {
      mediaArray.push(new Media(media));
    });
    return mediaArray;
  }
}

export default Attachment;
