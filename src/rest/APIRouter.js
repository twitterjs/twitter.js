'use strict';

const noop = () => {};
const methods = ['get', 'post', 'delete', 'patch', 'put'];
const reflectors = ['toString'];

export function buildRoute(manager) {
  const route = [''];
  const handler = {
    get(target, property) {
      if (reflectors.includes(property)) return () => route.join('/');
      if (methods.includes(property)) {
        return options => manager.request(property, route.join('/'), Object.assign({}, options));
      }
      route.push(property);
      return new Proxy(noop, handler);
    },
    apply(target, _, argumentsList) {
      route.push(...argumentsList.filter(arg => arg != null));
      return new Proxy(noop, handler);
    },
  };
  return new Proxy(noop, handler);
}
