'use strict';

import BaseClient from './BaseClient.js';
import { Events } from '../util/Constants.js';
import { Messages } from '../errors/ErrorMessages.js';
import UserManager from '../managers/UserManager.js';
import TweetManager from '../managers/TweetManager.js';

/**
 * This class is the core of the library and represents the bot itself
 * @extends {BaseClient}
 */
class Client extends BaseClient {
  constructor() {
    super();

    Object.defineProperty(this, 'token', { writable: true });
    /**
     * The credentials of the bot
     * @type {?ClientCredentials}
     */
    this.token = null;

    /**
     * Time at which the client was marked as `READY`
     * @type {?Date}
     */
    this.readyAt = null;

    /**
     * The user manager of this client
     * @type {UserManager}
     */
    this.users = new UserManager(this);

    /**
     * The tweet manager of this client
     * @type {TweetManager}
     */
    this.tweets = new TweetManager(this);
  }

  /**
   * An object containing credentials for the client
   * @typedef {Object} ClientCredentials
   * @property {string} consumerKey
   * @property {string} consumerSecret
   * @property {string} accessToken
   * @property {string} accessTokenSecret
   * @property {string} bearerToken
   */

  /**
   * Sets the credentials as a property of the client for later use. Emits the `ready` event on success
   * @param {ClientCredentials} credentials Credentials for the client
   * @returns {ClientCredentials} Credentials object that was provided
   * @example
   * client.login('Your-Credentials');
   */
  login(credentials) {
    if (!credentials) {
      throw new Error(Messages.TOKEN_INVALID);
    }
    this.token = credentials;
    this._triggerClientReady();
    return this.token;
  }

  /**
   * Marks the client as ready by assigning the 'readyAt' property and emits the ready event
   * @private
   */
  _triggerClientReady() {
    this.readyAt = new Date();

    /**
     * Emitted when the client becomes ready
     * @event Client#ready
     */
    this.emit(Events.READY);
  }
}

export default Client;
