import { BaseStructure } from './BaseStructure';
import type { Client } from '../client';
import type { APIList, Snowflake } from 'twitter-types';
import type { UpdateListOptions, UserResolvable } from '../typings';

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

	/**
	 * Deletes this list.
	 * @returns An object containing the `deleted` field
	 */
	async delete() {
		return this.client.lists.delete(this.id);
	}

	/**
	 * Updates this list.
	 * @param options The options for updating the list
	 * @returns An object containing the `updated` field
	 */
	async update(options: UpdateListOptions) {
		return this.client.lists.update(this.id, options);
	}

	/**
	 * Adds a member to this list.
	 * @param user The user to add as a member of the list
	 * @returns An object containing the `is_member` field
	 */
	async addMember(user: UserResolvable) {
		return this.client.lists.addMember(this.id, user);
	}

	/**
	 * Removes a member from this list.
	 * @param user The member to remove from the list
	 * @returns An object containing the `is_member` field
	 */
	async removeMember(user: UserResolvable) {
		return this.client.lists.removeMember(this.id, user);
	}

	/**
	 * Follows this list.
	 * @returns An object containing the `following` field
	 */
	async follow() {
		return this.client.lists.follow(this.id);
	}

	/**
	 * Unfollows this list.
	 * @returns An object containing the `following` field
	 */
	async unfollow() {
		return this.client.lists.unfollow(this.id);
	}

	/**
	 * Pins this list.
	 * @returns An object containing the `pinned` field
	 */
	async pin() {
		return this.client.lists.pin(this.id);
	}

	/**
	 * Unpins this list.
	 * @returns An object containing the `pinned` field
	 */
	async unpin() {
		return this.client.lists.unpin(this.id);
	}

	/**
	 * Sets a new name for this list.
	 * @param name The name to set
	 * @returns An object containing the `updated` field
	 */
	async setName(name: string) {
		return this.update({ name });
	}

	/**
	 * Sets a new description for this list.
	 * @param description The description to set
	 * @returns An object containing the `updated` field
	 */
	async setDescription(description: string) {
		return this.update({ description });
	}

	/**
	 * Sets the privacy of this list.
	 * @param isPrivate Whether the list should be private
	 * @returns An object containing the `updated` field
	 */
	async setPrivate(isPrivate: boolean) {
		return this.update({ private: isPrivate });
	}
}
