import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIList, Snowflake } from 'twitter-types';

export class SimplifiedList extends BaseStructure {
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

  followerCount: number | null;

  memberCount: number | null;

  ownerId: Snowflake | null;

  createdAt: string | null;

  /**
   * @param client The logged in {@link Client} instance
   * @param data The raw data sent by the API for the list
   */
  constructor(client: Client, data: APIList) {
    super(client, data);
    this.name = data.name;
    this.description = data.description ?? null;
    this.private = data.private ?? null;
    this.followerCount = data.follower_count ?? null;
    this.memberCount = data.member_count ?? null;
    this.ownerId = data.owner_id ?? null;
    this.createdAt = data.created_at ?? null;
  }
}
