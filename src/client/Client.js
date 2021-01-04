'use strict';

import BaseClient from './BaseClient.js';
import { Events } from '../util/Constants.js';
import RESTManager from '../rest/RESTManager.js';
import { Messages } from '../errors/ErrorMessages.js';
import UserManager from '../managers/UserManager.js';

/**
 * This class is the core of the library and represents the bot itself
 * @extends {BaseClient}
 */
class Client extends BaseClient {
  constructor() {
    super();

    Object.defineProperty(this, 'token', { writable: true });
    if (!this.token && 'TWITTER_TOKEN' in process.env) {
      /**
       * Bearer token for the bot. Defaults to `TWITTER_TOKEN` if it is present in the env variables, else sets it to null
       * @type {?string}
       */
      this.token = process.env.TWITTER_TOKEN;
    } else {
      this.token = null;
    }

    /**
     * Time at which the client was marked as `READY`
     * @type {?Date}
     */
    this.readyAt = null;

    /**
     * The REST manager of this client
     * @type {RESTManager}
     * @private
     */
    this.rest = new RESTManager(this);

    /**
     * The user manager of this client
     * @type {UserManager}
     */
    this.users = new UserManager(this);
  }

  /**
   * Sets the Bearer Token as a property of the client for later use. Emits the `ready` event on success
   * @param {string} [token=this.token] Bearer token of the bot
   * @returns {string} The token that was provided
   * @example
   * client.login('Your-Bearer-Token');
   */
  login(token = this.token) {
    if (!token || typeof token !== 'string') {
      throw new Error(Messages.TOKEN_INVALID);
    }
    this.token = token;
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
