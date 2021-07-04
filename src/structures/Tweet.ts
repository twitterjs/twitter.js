import Poll from './Poll.js';
import Place from './Place.js';
import Media from './Media.js';
import Collection from '../util/Collection.js';
import SimplifiedUser from './SimplifiedUser.js';
import SimplifiedTweet from './SimplifiedTweet.js';
import type Client from '../client/Client.js';
import type {
  APIMediaObject,
  APIPlaceObject,
  APIPollObject,
  APITweetObject,
  APITweetReferencedTweetType,
  APIUserObject,
  GetSingleTweetByIdResponse,
} from 'twitter-types';

export default class Tweet extends SimplifiedTweet {
  /**
   * The author of the tweet
   */
  author: SimplifiedUser | null;

  /**
   * The users mentioned in the tweet
   */
  mentions: Collection<string, SimplifiedUser>;

  /**
   * The original tweet if this tweet is a reply
   */
  repliedTo: SimplifiedTweet | null;

  /**
   * The original tweet if this tweet is a quote
   */
  quoted: SimplifiedTweet | null;

  /**
   * The polls in the tweet
   */
  polls: Collection<string, Poll>;

  /**
   * The places tagged in the tweet
   */
  places: Collection<string, Place>;

  /**
   * The media contents in the tweet
   */
  media: Collection<string, Media>;

  constructor(client: Client, data: GetSingleTweetByIdResponse) {
    super(client, data.data);

    this.author = this._patchAuthor(data.includes?.users) ?? null;
    this.mentions = this._patchMentions(data.includes?.users);
    this.repliedTo = this._patchTweetReferences('replied_to', data.includes?.tweets) ?? null;
    this.quoted = this._patchTweetReferences('quoted', data.includes?.tweets) ?? null;
    this.polls = this._patchPolls(data.includes?.polls);
    this.places = this._patchPlaces(data.includes?.places);
    this.media = this._patchMedia(data.includes?.media);
  }

  private _patchAuthor(users?: Array<APIUserObject>): SimplifiedUser | undefined {
    if (!users) return;
    const rawAuthor = users.find(user => user.id === this.authorID);
    if (!rawAuthor) return;
    return new SimplifiedUser(this.client, rawAuthor);
  }

  private _patchMentions(users?: Array<APIUserObject>): Collection<string, SimplifiedUser> {
    const mentionedUsersCollection = new Collection<string, SimplifiedUser>();
    const mentions = this.entities?.mentions;
    if (!users || !mentions) return mentionedUsersCollection;
    for (const mention of mentions) {
      const rawMentionedUser = users.find(user => user.id === mention.id);
      if (!rawMentionedUser) continue;
      const mentionedUser = new SimplifiedUser(this.client, rawMentionedUser);
      mentionedUsersCollection.set(mentionedUser.id, mentionedUser);
    }
    return mentionedUsersCollection;
  }

  private _patchTweetReferences(
    referenceType: APITweetReferencedTweetType,
    tweets?: Array<APITweetObject>,
  ): SimplifiedTweet | undefined {
    const originalTweetID = this.referencedTweets?.find(tweet => tweet.type === referenceType)?.id;
    if (!originalTweetID || !tweets) return;
    const rawOriginalTweet = tweets.find(tweet => tweet.id === originalTweetID);
    if (!rawOriginalTweet) return;
    return new SimplifiedTweet(this.client, rawOriginalTweet);
  }

  private _patchPolls(rawPolls?: Array<APIPollObject>): Collection<string, Poll> {
    const pollsCollection = new Collection<string, Poll>();
    if (!rawPolls) return pollsCollection;
    for (const rawPoll of rawPolls) {
      const poll = new Poll(this.client, rawPoll);
      pollsCollection.set(poll.id, poll);
    }
    return pollsCollection;
  }

  private _patchPlaces(rawPlaces?: Array<APIPlaceObject>): Collection<string, Place> {
    const placesCollection = new Collection<string, Place>();
    if (!rawPlaces) return placesCollection;
    for (const rawPlace of rawPlaces) {
      const place = new Place(this.client, rawPlace);
      placesCollection.set(place.id, place);
    }
    return placesCollection;
  }

  private _patchMedia(rawMediaContents?: Array<APIMediaObject>): Collection<string, Media> {
    const mediaCollection = new Collection<string, Media>();
    if (!rawMediaContents) return mediaCollection;
    for (const rawMediaContent of rawMediaContents) {
      const mediaContent = new Media(this.client, rawMediaContent);
      mediaCollection.set(mediaContent.id, mediaContent);
    }
    return mediaCollection;
  }
}
