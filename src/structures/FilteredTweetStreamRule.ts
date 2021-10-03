import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIFilteredTweetStreamRule, Snowflake } from 'twitter-types';

export class FilteredTweetStreamRule extends BaseStructure {
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

/**
 * The rule that matched against the filtered tweet
 */
export class MatchingRule {
  /**
   * The id of the filter rule
   */
  id: Snowflake;

  /**
   * The tag of the filter rule
   */
  tag: string | null;

  constructor(data: { id: Snowflake; tag?: string }) {
    this.id = data.id;
    this.tag = typeof data.tag === 'string' ? (data.tag.length > 0 ? data.tag : null) : null;
  }
}
