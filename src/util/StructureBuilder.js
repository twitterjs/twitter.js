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
      const user = new User(client, element.data);
      if (element.includes?.tweets[0]) {
        user.pinnedTweet = new Tweet(client, element.includes.tweets[0]);
      }
      user.publicMetrics = new UserPublicMetrics(element.data.public_metrics);
      user.entities = new Entity(element.data.entities);
      usersCollection.set(user.id, user);
    });
    return usersCollection;
  } else {
    const user = new User(client, userData.data);
    if (userData.includes?.tweets) {
      user.pinnedTweet = new Tweet(client, userData.includes.tweets[0]);
    }
    user.publicMetrics = new UserPublicMetrics(userData.data.public_metrics);
    user.entities = new Entity(userData.data.entities);
    return user;
  }
}
