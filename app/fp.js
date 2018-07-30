export { createSelector } from "reselect";
export { compose, reduce, find, filter, get, eq, map, pick } from "lodash/fp";

import compose from "lodash/fp/compose";
import get from "lodash/fp/get";

export const not = fn => (...args) => !fn(...args);
export const bool = compose(
  not,
  not
);
export const or = (...fns) => (...args) => {
  let result;
  return fns.find(fn => (result = fn(...args))) ? result : false;
};
export const and = (...fns) => (...args) => {
  let result;
  return !fns.find((fn, idx) => (idx === 0 ? !(result = fn(...args)) : !fn(...args)))
    ? result
    : false;
};

export function cond(conditionPairs = []) {
  for (const [cond, result] of conditionPairs) {
    if (cond) {
      return result;
    }
  }
  return null;
}

// Currently redux state is not immutable causing issues with real selectors
// This is a temporary hack to allow same code style until that is fixed.
export const createSelectorEager = (keyFns, resultFn) => (...args) =>
  resultFn(...keyFns.map(fn => fn(...args)));

// Given a hash of keys to functions, creates a selector that returns a map of function results
export const selectorMap = fns =>
  createSelectorEager(Object.keys(fns).map(key => fns[key]), (...args) =>
    Object.keys(fns).reduce((res, key, idx) => ({ ...res, [key]: args[idx] }), {})
  );

export const substruct = (structure, obj) =>
  Object.keys(structure).reduce(
    (res, key) => ({ ...res, [structure[key] || key]: get(key, obj) }),
    {}
  );

export const apply = (fn, ...args) => fn(...args);

export const eql = x => y => x === y;
export const increment = x => x + 1;
export const decrement = x => x - 1;
export const add = x => y => x + y;
export const last = (arr = []) => arr[arr.length - 1];
export const range = num => [...Array(num).keys()];
export const neg = x => Math.abs(x) * -1;

export function mapValues(obj, callback) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = callback(value);
  }
  return result;
}

export function filterKeys(predicate) {
  return obj =>
    Object.entries(obj).reduce((acc, [key, value]) => {
      if (predicate(key)) {
        acc[key] = value;
      }
      return acc;
    }, {});
}
// set utils
export function addToSet(set = new Set(), iterable) {
  for (const item of iterable) {
    set.add(item);
  }
  return set;
}

export function intersect(arr1, arr2) {
  for (const el1 of arr1) {
    for (const el2 of arr2) {
      if (el1 === el2) {
        return true;
      }
    }
  }
  return false;
}

// transduce operations
export const filtering = predicate => reducer => (acc, element) =>
  predicate(element) ? reducer(acc, element) : acc;
export const mapping = func => reducer => (acc, elem) => reducer(acc, func(elem));
