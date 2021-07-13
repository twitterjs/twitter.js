import BaseClient from './BaseClient.js';
import type { ClientEventsMapping, ClientOptions } from '../typings/Interfaces.js';
import type {
  ClientEventArgsType,
  ClientEventKeyType,
  ClientEventListenerType,
  ClientUnionType,
} from '../typings/Types.js';

/**
 * The class for holding common members of {@link BearerClient} and {@link UserContextClient}
 */
export default class CommonClient<C extends ClientUnionType> extends BaseClient {
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

  override on<K extends keyof ClientEventsMapping<C> | symbol>(
    event: ClientEventKeyType<K, C>,
    listener: (...args: ClientEventListenerType<K, C>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  override once<K extends keyof ClientEventsMapping<C> | symbol>(
    event: ClientEventKeyType<K, C>,
    listener: (...args: ClientEventListenerType<K, C>) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  override emit<K extends keyof ClientEventsMapping<C> | symbol>(
    event: ClientEventKeyType<K, C>,
    ...args: ClientEventArgsType<K, C>
  ): boolean {
    return super.emit(event, ...args);
  }
}
