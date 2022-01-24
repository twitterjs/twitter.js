import type { APIInvalidRequestProblemErrors, APIProblem } from 'twitter-types';

export class TwitterAPIError extends Error {
	title: string;
	detail: string;
	type: string;

	scope: string | null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any; // TODO
	field: string | null;
	period: string | null;
	status: number | null;
	reason: string | null;
	section: string | null;
	parameter: string | null;
	resource_id: string | null;
	resource_type: string | null;
	disconnect_type: string | null;
	registration_url: string | null;
	connection_issue: string | null;
	errors: Record<string, string> | null;

	constructor(data: APIProblem) {
		super(data.detail);
		this.title = data.title;
		this.detail = data.detail;
		this.type = data.type;

		this.scope = 'scope' in data ? data.scope : null;
		this.value = 'value' in data ? data.value : null;
		this.field = 'field' in data ? data.field : null;
		this.status = 'status' in data ? data.status : null;
		this.period = 'period' in data ? data.period : null;
		this.reason = 'reason' in data ? data.reason : null;
		this.section = 'section' in data ? data.section : null;
		this.parameter = 'parameter' in data ? data.parameter : null;
		this.resource_id = 'resource_id' in data ? data.resource_id : null;
		this.resource_type = 'resource_type' in data ? data.resource_type : null;
		this.disconnect_type = 'disconnect_type' in data ? data.disconnect_type : null;
		this.registration_url = 'registration_url' in data ? data.registration_url : null;
		this.connection_issue = 'connection_issue' in data ? data.connection_issue : null;
		// this should always be at the bottom
		this.errors = 'errors' in data ? this.#patchErrors(data.errors) : null;
	}

	override get name(): string {
		return `${this.constructor.name} [${this.title}]`;
	}

	#patchErrors(errors: Array<APIInvalidRequestProblemErrors>): Record<string, string> {
		const errorsObject: Record<string, string> = {};
		for (const [i, error] of errors.entries()) {
			errorsObject[i] = error.message;
		}
		return errorsObject;
	}
}
