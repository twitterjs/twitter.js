'use strict';

import fetch from 'node-fetch';
import {
  getTweetByIdEndpoint,
  getUserByIdEndpoint,
  getUserByUsernameEndpoint,
  getUsersByIdsEndpoint,
  getUsersByUsernamesEndpoint,
  getTweetsByIdsEndpoint,
  getHideUnhideReplyEndpoint,
} from './EndpointResolver.js';
import { getHeaderObject, getUserContextHeaderObject } from './HeaderResolver.js';
import { HTTPverbs } from '../util/Constants.js';

/**
 * This class holds the methods for REST API calls for every endpoints of Twitter API v2
 */
class RESTManager {
  /**
   * @param {Client} client The client that instantiated this class
   */
  constructor(client) {
    /**
     * @type {Client}
     */
    this.client = client;
  }

  /**
   * Fetches a tweet from Twitter using its ID
   * @param {string} id ID of the tweet
   * @returns {Promise<Object>} An object containing the tweet data
   */
  async fetchTweetById(id) {
    const endpoint = getTweetByIdEndpoint(id);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token.bearerToken);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches upto 100 tweets from Twitter using their IDs
   * @param {Array<string>} ids IDs of the tweets
   * @returns {Promise<Object>} An object containing the tweets data
   */
  async fetchTweetsByIds(ids) {
    const endpoint = getTweetsByIdsEndpoint(ids);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token.bearerToken);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches a user from Twitter using its ID
   * @param {string} id ID of the user
   * @returns {Promise<Object>} An object containing the user data
   */
  async fetchUserById(id) {
    const endpoint = getUserByIdEndpoint(id);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token.bearerToken);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches a user form Twitter using its username
   * @param {string} username Username of the user
   * @returns {Promise<Object>} An object containing the user data
   */
  async fetchUserByUsername(username) {
    const endpoint = getUserByUsernameEndpoint(username);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token.bearerToken);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches users from Twitter using their IDs
   * @param {Array<string>} ids An array of IDs of the users to fetch
   * @returns {Promise<Object>} An object containing the users data;
   */
  async fetchUsersByIds(ids) {
    const endpoint = getUsersByIdsEndpoint(ids);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token.bearerToken);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches users from Twitter using their usernames
   * @param {Array<string>} usernames An array of usernames of the users to fetch
   * @returns {Promise<Object>} An object containing the users data
   */
  async fetchUsersByUsernames(usernames) {
    const endpoint = getUsersByUsernamesEndpoint(usernames);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token.bearerToken);
    const res = await fetch(endpoint, header);
    const data = res.json();
    return data;
  }

  /**
   * Hides or unhides a tweet that is a reply to one of the user's tweet
   * @param {string} id The ID of the tweet to hide or unhide
   * @param {boolean} hideOrUnhide True if the reply is to be hiddenn, else false
   * @returns {Promise<object>}
   */
  async hideUnhideReply(id, hideOrUnhide) {
    const endpoint = getHideUnhideReplyEndpoint(id);
    const header = getUserContextHeaderObject(HTTPverbs.PUT, this.client.token, endpoint, hideOrUnhide);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }
}

export default RESTManager;
