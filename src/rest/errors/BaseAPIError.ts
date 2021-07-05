import type { APIProblemFields } from 'twitter-types';

export default class BaseAPIError extends Error {
  title: string;

  detail: string;

  constructor(data: APIProblemFields) {
    super(data.detail);
    this.title = data.title;
    this.detail = data.detail;
  }
}
