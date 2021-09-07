import { EventEmitter } from 'events';
import { mergeDefault } from '../util/Utility.js';
import { defaultClientOptions } from '../util/Constants.js';
import type { ClientOptions } from '../typings/Interfaces.js';

/**
 * The base class for all clients
 */
export class BaseClient extends EventEmitter {
  /**
   * The options to pass when initiating the client
   */
  options: ClientOptions;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options = {}) {
    super();

    this.options = mergeDefault(defaultClientOptions, options);
  }
}
