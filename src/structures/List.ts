import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIList } from 'twitter-types';

export class List extends BaseStructure {
  /**
   * The name of the list
   */
  name: string;

  /**
   * The description of the list
   */
  description: string | null;

  /**
   * Whether the list is private
   */
  private: boolean | null;

  /**
   * @param client The logged in {@link Client} instance
   * @param data The raw data sent by the API for the list
   */
  constructor(client: Client, data: APIList) {
    super(client, data);
    this.name = data.name;
    this.description = data.description ?? null;
    this.private = data.private ?? null;
  }
}
