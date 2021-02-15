'use strict';

import fetch from 'node-fetch';

class APIRequest {
  constructor(rest, method, path, options) {
    this.rest = rest;
    this.method = method;
    this.path = path;
    this.client = rest.client;
    this.options = options;

    if (options.query) {
      // let queryString = '';
      let queryString = Object.entries(options.query)
        .filter(([, value]) => value !== null && typeof value !== 'undefined')
        .map(([key, value]) => (Array.isArray(value) ? `${key}=${value.join(',')}` : `${key}=${value}`))
        .join('&');

      this.path = `${path}?${queryString}`;
    }
  }

  make() {
    const API = `${this.client.options.http.api}/${this.client.options.http.version}`;
    const url = API + this.path;

    let headers = {};
    headers.Authorization = this.options.userContext
      ? this.rest.getUserContextAuth(this.method, url)
      : this.rest.getAuth();

    let body;
    if (this.method !== 'get' && this.options.body) {
      body = JSON.stringify(this.options.body);
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      method: this.method,
      headers,
      body,
    }).then(res => res.json());
  }
}

export default APIRequest;
