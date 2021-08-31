import BaseStructure from './BaseStructure.js';
import type { ClientInUse, ClientUnionType } from '../typings/index.js';
import type { APIFilteredTweetStreamRule, Snowflake } from 'twitter-types';

export default class FilteredTweetStreamRule<C extends ClientUnionType> extends BaseStructure<C> {
  /**
   * The id of the rule
   */
  id: Snowflake;

  tag: string | null;

  /**
   * The value of the rule
   */
  value: string;

  constructor(client: ClientInUse<C>, data: APIFilteredTweetStreamRule) {
    super(client);

    this.id = data.id;
    this.tag = data.tag ?? null;
    this.value = data.value;
  }
}
