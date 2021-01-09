// holds functions for cleaning HTTP Response that are too dirty to be used by the Structure Builder as it is
'use strict';

import Collection from './Collection.js';

export function cleanFetchManyUsersResponse(response) {
  const userDataCollection = new Collection();
  response.forEach(element => {
    element.data.forEach(data => {
      const userData = { data: null, includes: { tweets: [] } };
      userData.data = data;
      userDataCollection.set(data.id, userData);
    });
    element?.includes?.tweets.forEach(tweet => {
      const userData = userDataCollection.get(tweet.author_id);
      userData.includes.tweets.push(tweet);
      userDataCollection.set(tweet.author_id, userData);
    });
  });
  return userDataCollection;
}
