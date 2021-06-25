import BaseStructure from './BaseStructure.js';
import type Client from '../client/Client.js';

export default class Tweet extends BaseStructure {
  constructor(client: Client, data: any) {
    super(client, data.id);
  }
}
