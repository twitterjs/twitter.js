import { EventEmitter } from 'node:events';
import { mergeDefault, defaultClientOptions } from '../util';
import type {
	ClientEventArgsType,
	ClientEventKeyType,
	ClientEventListenerType,
	ClientEventsMapping,
	ClientOptions,
} from '../typings';

/**
 * The base client class
 */
export class BaseClient extends EventEmitter {
	/**
	 * The options passed to the client during initialization
	 */
	options: ClientOptions;

	/**
	 * @param options The options to initialize the client with
	 */
	constructor(options?: ClientOptions) {
		super();

		this.options = typeof options === 'object' ? mergeDefault(defaultClientOptions, options) : defaultClientOptions;
	}

	override on<K extends keyof ClientEventsMapping | symbol>(
		event: ClientEventKeyType<K>,
		listener: (...args: ClientEventListenerType<K>) => void,
	): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		super.on(event, listener as (...args: any[]) => void);
		return this;
	}

	override once<K extends keyof ClientEventsMapping | symbol>(
		event: ClientEventKeyType<K>,
		listener: (...args: ClientEventListenerType<K>) => void,
	): this {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		super.on(event, listener as (...args: any[]) => void);
		return this;
	}

	override emit<K extends keyof ClientEventsMapping | symbol>(
		event: ClientEventKeyType<K>,
		...args: ClientEventArgsType<K>
	): boolean {
		return super.emit(event, ...args);
	}
}
