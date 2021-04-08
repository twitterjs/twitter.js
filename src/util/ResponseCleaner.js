// holds functions for cleaning HTTP Response that are too dirty to be used by the Structure Builder as it is
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

export function cleanFetchManyTweetsResponse(response) {
  const tweetDataCollection = new Collection();
  response.data.forEach(data => {
    const tweetData = { data: null, includes: { media: [], users: [] } };
    tweetData.data = data;
    tweetDataCollection.set(data.id, tweetData);
  });
  response?.includes?.users.forEach(user => {
    const tweetData = tweetDataCollection.find(tweetData => tweetData.data.author_id === user.id);
    if (tweetData) {
      tweetData.includes.users.push(user);
      tweetDataCollection.set(tweetData.data.id, tweetData);
    }
  });
  return tweetDataCollection;
}

export function cleanFetchFollowingResponse(response) {
  const userDataCollection = new Collection();
  response.data.forEach(data => {
    const userData = { data: null, includes: { tweets: [] } };
    userData.data = data;
    userDataCollection.set(data.id, userData);
  });
  response?.includes?.tweets.forEach(tweet => {
    const userData = userDataCollection.get(tweet.author_id);
    userData.includes.tweets.push(tweet);
    userDataCollection.set(tweet.author_id, userData);
  });
  return userDataCollection;
}
