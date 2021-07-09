import BaseClient from './BaseClient.js';
import type { ClientEventsMapping, ClientOptions } from '../typings/Interfaces.js';
import type { ClientEventArgsType, ClientEventKeyType, ClientEventListenerType } from '../typings/Types.js';

/**
 * The class for holding common members of {@link BearerClient} and {@link UserContextClient}
 */
export default class CommonClient extends BaseClient {
  /**
   * The time at which the client became `ready`
   */
  readyAt: Date | null;

  /**
   * @param options The options to initialize the client with
   */
  constructor(options?: ClientOptions) {
    super(options);

    this.readyAt = null;
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
    return super.emit(event, args);
  }
}