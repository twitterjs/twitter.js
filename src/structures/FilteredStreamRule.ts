import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIFilteredTweetStreamRule, Snowflake } from 'twitter-types';

export class FilteredStreamRule extends BaseStructure {
  tag: string | null;

  /**
   * The value of the rule
   */
  value: string;

  constructor(client: Client, data: APIFilteredTweetStreamRule) {
    super(client, data);
    this.tag = data.tag ?? null;
    this.value = data.value;
  }
}
