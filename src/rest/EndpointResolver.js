'use strict';

import {
  tweetById,
  tweetFields,
  expansionsForTweet,
  userFields,
  mediaFields,
  placeFields,
  pollFields,
  userById,
  expansionsForUser,
  userByUsername,
  usersByIds,
  usersByUsernames,
  tweetsByIds,
} from '../util/Constants.js';

/**
 * Resolves the endpoint for fetching a tweet using its ID
 * @param {string} id The ID of the tweet
 * @returns {string} The endpoint url for fetching a single tweet using its ID
 */
export function getTweetByIdEndpoint(id) {
  const endpoint = `${tweetById}${id}?tweet.fields=${tweetFields}&expansions=${expansionsForTweet}&user.fields=${userFields}&media.fields=${mediaFields}&place.fields=${placeFields}&poll.fields=${pollFields}`;
  return endpoint;
}

/**
 * Resolves the endpoint for fetching upto 100 tweets using their IDs
 * @param {Array<string>} ids An array of IDs of the tweets to fetch
 * @returns {string} The endpoint url for fetching upto 100 tweets using their IDs
 */
export function getTweetsByIdsEndpoint(ids) {
  const idsArray = ids.join();
  const endpoint = `${tweetsByIds}?ids=${idsArray}&tweet.fields=${tweetFields}&expansions=${expansionsForTweet}&user.fields=${userFields}&media.fields=${mediaFields}&place.fields=${placeFields}&poll.fields=${pollFields}`;
  return endpoint;
}

/**
 * Resolves the endpoint for fetching a user using its ID
 * @param {string} id The ID of the user
 * @returns {string} The endpoint url for fetching a single user using its ID
 */
export function getUserByIdEndpoint(id) {
  const endpoint = `${userById}${id}?user.fields=${userFields}&expansions=${expansionsForUser}&tweet.fields=${tweetFields}`;
  return endpoint;
}

/**
 * Resolves the endpoint for fetching a user using its username
 * @param {string} username The username of the user
 * @returns {string} The endpoint url for fetching a single user using its username
 */
export function getUserByUsernameEndpoint(username) {
  const endpoint = `${userByUsername}${username}?user.fields=${userFields}&expansions=${expansionsForUser}&tweet.fields=${tweetFields}`;
  return endpoint;
}

/**
 * Resolves the endpoint for fetching users using their IDs
 * @param {Array<string>} ids An array of IDs of the users to fetch
 * @returns {string} The endpoint url for fetching users using their IDs
 */
export function getUsersByIdsEndpoint(ids) {
  let idsArray = ids.join();
  const endpoint = `${usersByIds}?ids=${idsArray}&user.fields=${userFields}&expansions=${expansionsForUser}&tweet.fields=${tweetFields}`;
  return endpoint;
}

/**
 * Resolves the endpoint for fetching users using their usernames
 * @param {Array<string>} usernames An array of usernames of the users to fetch
 * @returns {string} The endpoint url for fetching users using their usernames
 */
export function getUsersByUsernames(usernames) {
  let usernamesArray = usernames.join();
  const endpoint = `${usersByUsernames}?usernames=${usernamesArray}&user.fields=${userFields}&expansions=${expansionsForUser}&tweet.fields=${tweetFields}`;
  return endpoint;
}

/**
 * Resolves the endpoint for hiding or unhiding a reply
 * @param {string} id The ID of the reply tweet to hide or unhide
 * @returns {string} The endpoint url to hide or unhide a reply
 */
export function getHideUnhideReplyEndpoint(id) {
  const endpoint = `${tweetById}${id}/hidden`;
  return endpoint;
}
