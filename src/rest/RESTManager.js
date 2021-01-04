'use strict';

import fetch from 'node-fetch';
import {
  getTweetByIdEndpoint,
  getUserByIdEndpoint,
  getUserByUsernameEndpoint,
  getUsersByIdsEndpoint,
  getUsersByUsernames,
} from './EndpointResolver.js';
import { getHeaderObject } from './HeaderResolver.js';
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
   * @param {Snowflake} id ID of the tweet
   * @returns {Promise<Object>} An object containing the tweet data
   */
  async fetchTweetById(id) {
    const endpoint = getTweetByIdEndpoint(id);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches a user from Twitter using its ID
   * @param {Snowflake} id ID of the user
   * @returns {Promise<Object>} An object containing the user data
   */
  async fetchUserById(id) {
    const endpoint = getUserByIdEndpoint(id);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token);
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
    const header = getHeaderObject(HTTPverbs.GET, this.client.token);
    const res = await fetch(endpoint, header);
    const data = await res.json();
    return data;
  }

  /**
   * Fetches users from Twitter using their IDs
   * @param {Array<Snowflake>} ids An array of IDs of the users to fetch
   * @returns {Promise<Object>} An object containing the users data;
   */
  async fetchUsersByIds(ids) {
    const endpoint = getUsersByIdsEndpoint(ids);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token);
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
    const endpoint = getUsersByUsernames(usernames);
    const header = getHeaderObject(HTTPverbs.GET, this.client.token);
    const res = await fetch(endpoint, header);
    const data = res.json();
    return data;
  }
}

export default RESTManager;
