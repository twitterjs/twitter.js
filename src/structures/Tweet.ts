import Poll from './Poll.js';
import Place from './Place.js';
import Media from './Media.js';
import Collection from '../util/Collection.js';
import SimplifiedUser from './SimplifiedUser.js';
import SimplifiedTweet from './SimplifiedTweet.js';
import type { ClientInUse, ClientUnionType } from '../typings/Types.js';
import type {
  APIMedia,
  APIPlace,
  APIPoll,
  APITweet,
  APITweetReferencedTweetType,
  APIUser,
  GetSingleTweetByIdResponse,
} from 'twitter-types';

/**
 * The class that represents a tweet on Twitter
 */
export default class Tweet<C extends ClientUnionType> extends SimplifiedTweet<C> {
  /**
   * The author of the tweet
   */
  author: SimplifiedUser<C> | null;

  /**
   * The users mentioned in the tweet
   */
  mentions: Collection<string, SimplifiedUser<C>>;

  /**
   * The original tweet if this tweet is a reply
   */
  repliedTo: SimplifiedTweet<C> | null;

  /**
   * The original tweet if this tweet is a quote
   */
  quoted: SimplifiedTweet<C> | null;

  /**
   * The polls in the tweet
   */
  polls: Collection<string, Poll<C>>;

  /**
   * The places tagged in the tweet
   */
  places: Collection<string, Place<C>>;

  /**
   * The media contents in the tweet
   */
  media: Collection<string, Media<C>>;

  constructor(client: ClientInUse<C>, data: GetSingleTweetByIdResponse) {
    super(client, data.data);

    this.author = this.#patchAuthor(data.includes?.users) ?? null;
    this.mentions = this.#patchMentions(data.includes?.users);
    this.repliedTo = this.#patchTweetReferences('replied_to', data.includes?.tweets) ?? null;
    this.quoted = this.#patchTweetReferences('quoted', data.includes?.tweets) ?? null;
    this.polls = this.#patchPolls(data.includes?.polls);
    this.places = this.#patchPlaces(data.includes?.places);
    this.media = this.#patchMedia(data.includes?.media);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  #patchAuthor(users?: Array<APIUser>): SimplifiedUser<C> | undefined {
    if (!users) return;
    const rawAuthor = users.find(user => user.id === this.authorID);
    if (!rawAuthor) return;
    return new SimplifiedUser(this.client, rawAuthor);
  }

  #patchMentions(users?: Array<APIUser>): Collection<string, SimplifiedUser<C>> {
    const mentionedUsersCollection = new Collection<string, SimplifiedUser<C>>();
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

  #patchTweetReferences(
    referenceType: APITweetReferencedTweetType,
    tweets?: Array<APITweet>,
  ): SimplifiedTweet<C> | undefined {
    const originalTweetID = this.referencedTweets?.find(tweet => tweet.type === referenceType)?.id;
    if (!originalTweetID || !tweets) return;
    const rawOriginalTweet = tweets.find(tweet => tweet.id === originalTweetID);
    if (!rawOriginalTweet) return;
    return new SimplifiedTweet(this.client, rawOriginalTweet);
  }

  #patchPolls(rawPolls?: Array<APIPoll>): Collection<string, Poll<C>> {
    const pollsCollection = new Collection<string, Poll<C>>();
    if (!rawPolls) return pollsCollection;
    for (const rawPoll of rawPolls) {
      const poll = new Poll(this.client, rawPoll);
      pollsCollection.set(poll.id, poll);
    }
    return pollsCollection;
  }

  #patchPlaces(rawPlaces?: Array<APIPlace>): Collection<string, Place<C>> {
    const placesCollection = new Collection<string, Place<C>>();
    if (!rawPlaces) return placesCollection;
    for (const rawPlace of rawPlaces) {
      const place = new Place(this.client, rawPlace);
      placesCollection.set(place.id, place);
    }
    return placesCollection;
  }

  #patchMedia(rawMediaContents?: Array<APIMedia>): Collection<string, Media<C>> {
    const mediaCollection = new Collection<string, Media<C>>();
    if (!rawMediaContents) return mediaCollection;
    for (const rawMediaContent of rawMediaContents) {
      const mediaContent = new Media(this.client, rawMediaContent);
      mediaCollection.set(mediaContent.id, mediaContent);
    }
    return mediaCollection;
  }
}
