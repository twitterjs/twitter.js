import type { ErrorMessageBuilder, TwitterjsErrorConstructor } from '../typings';

const errorMessagesMap = new Map<string, string | ErrorMessageBuilder>();

export function makeTwitterjsError(Base: ErrorConstructor): TwitterjsErrorConstructor {
	return class TwitterjsError extends Base {
		code: string;

		constructor(key: string, ...args: Array<unknown>) {
			super(formatErrorMessage(key, args));
			this.code = key;
			if (Error.captureStackTrace) Error.captureStackTrace(this, TwitterjsError);
		}

		override get name(): string {
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
