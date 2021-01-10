'use strict';

import User from '../structures/User.js';
import Collection from './Collection.js';
import Tweet from '../structures/Tweet.js';
import UserPublicMetrics from '../structures/UserPublicMetrics.js';
import Entity from '../structures/Entity.js';

/**
 * Builds a User structure
 * @param {Client} client
 * @param {Object|Collection} userData
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
  const userPublicMetricsData = element?.data?.public_metrics;
  if (userPublicMetricsData) user.publicMetrics = new UserPublicMetrics(userPublicMetricsData);
  const userEntityData = element?.data?.entities;
  if (userEntityData) user.entities = new Entity(userEntityData);
  return user;
}

/**
 * Builds a Tweet structure
 * @param {Client} client
 * @param {Object|Collection} tweetData
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
  const authorPublicMetricsData = authorData?.public_metrics;
  if (authorPublicMetricsData) tweet.author.publicMetrics = new UserPublicMetrics(authorPublicMetricsData);
  const authorEntityData = authorData?.entities;
  if (authorEntityData) tweet.author.entities = new Entity(authorEntityData);
  return tweet;
}
