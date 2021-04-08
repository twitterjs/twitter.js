import { EventEmitter } from 'events';
import RESTManager from '../rest/RESTManager.js';
import { DefaultClientOptions } from '../util/Constants.js';
import { mergeDefault } from '../util/Util.js';

/**
 * The base class for all clients
 * @extends {EventEmitter}
 * @abstract
 */
class BaseClient extends EventEmitter {
  constructor(options = {}) {
    super();

    /**
     * The options with which the client was initiated with
     * @type {ClientOptions}
     */
    this.options = mergeDefault(DefaultClientOptions, options);

    /**
     * The REST manager of this client
     * @type {RESTManager}
     * @private
     */
    this.rest = new RESTManager(this);
  }

  /**
   * Shortcut for rest
   * @private
   */
  get api() {
    return this.rest.api;
  }
}

export default BaseClient;
