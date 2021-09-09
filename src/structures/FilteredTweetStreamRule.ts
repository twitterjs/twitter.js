import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIFilteredTweetStreamRule, Snowflake } from 'twitter-types';

export class FilteredTweetStreamRule extends BaseStructure {
  /**
   * The id of the rule
   */
  id: Snowflake;

  tag: string | null;

  /**
   * The value of the rule
   */
  value: string;

  constructor(client: Client, data: APIFilteredTweetStreamRule) {
    super(client);

    this.id = data.id;
    this.tag = data.tag ?? null;
    this.value = data.value;
  }
}
