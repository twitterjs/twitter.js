import type { Client } from '../client';

/**
 * The base class for all structures
 */
export class BaseStructure {
	/**
	 * The instance of {@link Client} that was used to log in
	 */
	client: Client;

	/**
	 * The unique identifier of the strucutre
	 */
	id: string;

	/**
	 * @param client The logged in {@link Client} instance
	 * @param data The data for the base structure
	 */
	constructor(client: Client, data: BaseStructureData) {
		Object.defineProperty(this, 'client', { writable: true, enumerable: false });
		this.client = client;
		this.id = data.id;
	}
}

/**
 * The data to instantiate {@link BaseStructure} with
 */
export interface BaseStructureData {
	id: string;
}
