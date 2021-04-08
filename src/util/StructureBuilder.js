import User from '../structures/User.js';
import Collection from './Collection.js';
import Tweet from '../structures/Tweet.js';
import Attachment from '../structures/Attachment.js';

/**
 * Builds a User structure
 * @param {Client} client
 * @param {Object|Collection} userData
 * @private
 */
export function userBuilder(client, userData) {
  if (userData instanceof Collection) {
    const usersCollection = new Collection();
    userData.forEach(element => {
      usersCollection.set(element.data.id, _patchUser(client, element));
    });
    return usersCollection;
  } else {
    return _patchUser(client, userData);
  }
}

function _patchUser(client, element) {
  const user = new User(client, element.data);
  const pinnedTweetData = element?.includes?.tweets[0];
  if (pinnedTweetData) user.pinnedTweet = new Tweet(client, pinnedTweetData);
  return user;
}

/**
 * Builds a Tweet structure
 * @param {Client} client
 * @param {Object|Collection} tweetData
 * @private
 */
export function tweetBuilder(client, tweetData) {
  if (tweetData instanceof Collection) {
    const tweetCollection = new Collection();
    tweetData.forEach(element => {
      tweetCollection.set(element.data.id, _patchTweet(client, element));
    });
    return tweetCollection;
  } else {
    return _patchTweet(client, tweetData);
  }
}

function _patchTweet(client, element) {
  const tweet = new Tweet(client, element.data);
  const authorData = element?.includes?.users[0];
  if (authorData) tweet.author = new User(client, authorData);
  const attachmentsData = element?.includes;
  if (attachmentsData) tweet.attachments = new Attachment(attachmentsData);
  return tweet;
}
