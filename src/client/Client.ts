import BaseClient from './BaseClient.js';
import type { ClientOptions } from '../interfaces/index.js';

/**
 * The core of the library
 */
export default class Client extends BaseClient {
  constructor(options?: ClientOptions) {
    super(options);
  }
}
