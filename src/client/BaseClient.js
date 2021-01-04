'use strict';

import { EventEmitter } from 'events';

/**
 * The base class for all clients
 * @extends {EventEmitter}
 * @abstract
 */
class BaseClient extends EventEmitter {
  constructor() {
    super();
  }
}

export default BaseClient;
