import { Poll } from './Poll';
import { Place } from './Place';
import { Media } from './Media';
import { Collection } from '../util';
import { SimplifiedUser } from './SimplifiedUser';
import { SimplifiedTweet } from './SimplifiedTweet';
import type { Client } from '../client';
import type { TweetQuoteOptions, TweetReplyOptions } from '../typings';
import type {
  APIMedia,
  APIPlace,
  APIPoll,
  APITweet,
  APITweetReferencedTweetType,
  APIUser,
  GetSingleTweetByIdResponse,
  PostTweetCreateResponse,
} from 'twitter-types';

/**
 * The class that represents a tweet on Twitter
 */
export class Tweet extends SimplifiedTweet {
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

    this.author = this.#patchAuthor(data.includes?.users) ?? null;
    this.mentions = this.#patchMentions(data.includes?.users);
    this.repliedTo = this.#patchTweetReferences('replied_to', data.includes?.tweets) ?? null;
    this.quoted = this.#patchTweetReferences('quoted', data.includes?.tweets) ?? null;
    this.polls = this.#patchPolls(data.includes?.polls);
    this.places = this.#patchPlaces(data.includes?.places);
    this.media = this.#patchMedia(data.includes?.media);
  }

  /**
   * Sends a reply to this tweet
   * @param options The options for the reply
   * @returns The created reply
   */
  async reply(options: TweetReplyOptions): Promise<PostTweetCreateResponse> {
    return this.client.tweets.create({ ...options, inReplyToTweet: this.id });
  }

  /**
   * Quotes a tweet
   * @param options The options for quoting
   * @returns The created tweet
   */
  async quote(options: TweetQuoteOptions): Promise<PostTweetCreateResponse> {
    return this.client.tweets.create({ ...options, quoteTweet: this.id });
  }

  /**
   * Deletes this tweet if it was created by the authorized user.
   * @returns A boolean representing whether the tweet got deleted
   */
  async delete(): Promise<boolean> {
    return this.client.tweets.delete(this.id);
  }

  // #### 🚧 PRIVATE METHODS 🚧 ####

  #patchAuthor(users?: Array<APIUser>): SimplifiedUser | undefined {
    if (!users) return;
    const rawAuthor = users.find(user => user.id === this.authorId);
    if (!rawAuthor) return;
    return new SimplifiedUser(this.client, rawAuthor);
  }

  #patchMentions(users?: Array<APIUser>): Collection<string, SimplifiedUser> {
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

  #patchTweetReferences(
    referenceType: APITweetReferencedTweetType,
    tweets?: Array<APITweet>,
  ): SimplifiedTweet | undefined {
    const originalTweetId = this.referencedTweets?.find(tweet => tweet.type === referenceType)?.id;
    if (!originalTweetId || !tweets) return;
    const rawOriginalTweet = tweets.find(tweet => tweet.id === originalTweetId);
    if (!rawOriginalTweet) return;
    return new SimplifiedTweet(this.client, rawOriginalTweet);
  }

  #patchPolls(rawPolls?: Array<APIPoll>): Collection<string, Poll> {
    const pollsCollection = new Collection<string, Poll>();
    if (!rawPolls) return pollsCollection;
    for (const rawPoll of rawPolls) {
      const poll = new Poll(this.client, rawPoll);
      pollsCollection.set(poll.id, poll);
    }
    return pollsCollection;
  }

  #patchPlaces(rawPlaces?: Array<APIPlace>): Collection<string, Place> {
    const placesCollection = new Collection<string, Place>();
    if (!rawPlaces) return placesCollection;
    for (const rawPlace of rawPlaces) {
      const place = new Place(this.client, rawPlace);
      placesCollection.set(place.id, place);
    }
    return placesCollection;
  }

  #patchMedia(rawMediaContents?: Array<APIMedia>): Collection<string, Media> {
    const mediaCollection = new Collection<string, Media>();
    if (!rawMediaContents) return mediaCollection;
    for (const rawMediaContent of rawMediaContents) {
      const mediaContent = new Media(this.client, rawMediaContent);
      mediaCollection.set(mediaContent.id, mediaContent);
    }
    return mediaCollection;
  }
}
