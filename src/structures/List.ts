import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIList } from 'twitter-types';

export class List extends BaseStructure {
  /**
   * The name of the list
   */
  name: string;

  constructor(client: Client, data: APIList) {
    super(client, data);
    this.name = data.name;
  }
}
