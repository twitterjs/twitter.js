import { EventEmitter } from 'events';
import { mergeDefault, defaultClientOptions } from '../util';
import type { ClientOptions } from '../typings';

/**
 * The base class for all clients
 */
export class BaseClient extends EventEmitter {
  /**
   * The options passed to the client during initialization
   */
  options: ClientOptions;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options?: ClientOptions) {
    super();

    this.options = typeof options === 'object' ? mergeDefault(defaultClientOptions, options) : defaultClientOptions;
  }
}
