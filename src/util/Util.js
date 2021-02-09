'use strict';

// checks whether the key is present in the object
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * Set default properties to a given object
 * @param {Object} defaultObject Object that contains the default properties
 * @param {Object} given Object to which default properties are to be assigned
 * @returns {Object} Object containing defaults for properties that were not provided
 * @private
 */
export function mergeDefault(defaultObject, given) {
  if (!given) return defaultObject;
  for (const key in defaultObject) {
    if (!has(given, key) || given[key] === undefined) {
      given[key] = defaultObject[key];
    } else if (given[key] === Object(given[key])) {
      given[key] = mergeDefault(defaultObject[key], given[key]);
    }
  }
  return given;
}
