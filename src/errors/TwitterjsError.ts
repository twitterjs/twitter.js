import type { ErrorMessageBuilder, TwitterjsErrorConstructor } from '../typings/Interfaces.js';

const errorMessagesMap = new Map<string, string | ErrorMessageBuilder>();

export function makeTwitterjsError(Base: ErrorConstructor): TwitterjsErrorConstructor {
  return class TwitterjsError extends Base {
    code: string;
    message: string;

    constructor(key: string, ...args: Array<unknown>) {
      super();
      this.code = key;
      this.message = formatErrorMessage(key, args);
      if (Error.captureStackTrace) Error.captureStackTrace(this, TwitterjsError);
    }

    get name() {
      return `${super.name} [${this.code}]`;
    }
  };
}

export function formatErrorMessage(key: string, args: Array<unknown>): string {
  if (typeof key !== 'string') throw new Error('Error message key must be a string');
  const errorMessage = errorMessagesMap.get(key);
  if (!errorMessage) throw new Error(`An invalid error message key was used: ${key}.`);
  if (typeof errorMessage === 'function') return errorMessage(...args);
  if (typeof args === 'undefined' || args.length === 0) return errorMessage;
  args.unshift(errorMessage);
  return args.toString();
}

export function regsiterErrorMessage(
  key: string,
  message: string | ErrorMessageBuilder,
): Map<string, string | ErrorMessageBuilder> {
  return errorMessagesMap.set(key, typeof message === 'function' ? message : String(message));
}

export const CustomErrors = {
  CustomError: makeTwitterjsError(Error),
  CustomTypeError: makeTwitterjsError(TypeError),
  CustomRangeError: makeTwitterjsError(RangeError),
};
