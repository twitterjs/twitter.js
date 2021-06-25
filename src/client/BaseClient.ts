import { EventEmitter } from 'events';
import { mergeDefault } from '../util/Utility.js';
import { DefaultClientOptions } from '../util/Constants.js';
import type { ClientOptions } from '../interfaces/index.js';

/**
 * The base class for client
 */
export default class BaseClient extends EventEmitter {
  /**
   * The options to pass when initiating the client
   */
  options: ClientOptions;

  constructor(options = {}) {
    super();

    this.options = mergeDefault(DefaultClientOptions, options);
  }
}
