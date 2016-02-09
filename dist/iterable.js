/* eslint no-use-before-define: 0 */

/*
    @license
    Copyright (C) 2016 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.wrap = exports.from = exports.iter = exports.OrderedIterable = exports.MultiIterable = exports.GroupedIterable = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _zanaUtil = require('zana-util');

var _zanaUtil2 = _interopRequireDefault(_zanaUtil);

var _zanaCheck = require('zana-check');

var _zanaCheck2 = _interopRequireDefault(_zanaCheck);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const DATA = Symbol('data'); // swap this.data to use DATA instead

function buildMapArray(count) {
    let mapArray = new Array(count);
    for (let i = 0; i < count; i++) mapArray[i] = i;
    return mapArray;
}

function buildKeyArray(elements, selector, count) {
    let keyArray = new Array(count);
    for (let i = 0; i < count; i++) keyArray[i] = selector(elements[i]);
    return keyArray;
}

function compareKeys(comparer, keys, i1, i2) {
    let k1 = keys[i1];
    let k2 = keys[i2];
    let c = comparer(k1, k2);
    if (c === 0) return i1 - i2;
    return c;
}

function expand(iter) {
    if (iter && typeof iter === 'function') // could be mishandled. throw an error if iter() doesn't have [Symbol.iterator] defined?
        return iter();
    return iter;
}

function quicksort(keys, map, comparer, left, right) {
    do {
        let i = left;
        let j = right;
        let x = map[i + (j - i >> 1)];
        do {
            while (i < map.length && compareKeys(comparer, keys, x, map[i]) > 0) i++;
            while (j >= 0 && compareKeys(comparer, keys, x, map[j]) < 0) j--;
            if (i > j) break; // left index has crossed right index, stop the loop
            if (i < j) {
                ;
                var _ref = [map[j], map[i]];
                map[i] = _ref[0];
                map[j] = _ref[1];
            }i++;
            j--;
        } while (i <= j);
        if (j - left <= right - i) {
            if (left < j) quicksort(keys, map, comparer, left, j);
            left = i;
        } else {
            if (i < right) quicksort(keys, map, comparer, i, right);
            right = j;
        }
    } while (left < right);
}

function* reverse(iter, a) {
    if (!a.done) {
        yield* reverse(iter, iter.next());
        yield a.value;
    }
}

// lots of expanding here, may need some performance improvements
// consider detecting generatorFunctions with check.isIterable (somehow. es6 spec yet?)
function _flatten(item) {
    return function* () {
        let prev = expand(item);
        if (!_zanaCheck2.default.isIterable(prev)) yield prev;else {
            for (let v of prev) {
                if (!_zanaCheck2.default.isIterable(v) && !_zanaCheck2.default.instance(v, Function)) yield v;else yield* expand(_flatten(v));
            }
        }
    };
}

class Iterable {
    constructor(data) {
        this.data = data || [];
    }

    static empty() {
        return new Iterable([]);
    }

    static iter() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (args.length === 1) return new Iterable(args[0]);else if (args.length > 1) return new MultiIterable(...args);else return Iterable.empty();
    }

    get [Symbol.toStringTag]() {
        return 'Iterable';
    }

    [Symbol.iterator]() {
        return expand(this.data)[Symbol.iterator](); // covers arrays, sets, generator functions, generators..
    }

    aggregate() {
        let func = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];
        let seed = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        let iter = this[Symbol.iterator]();
        let result = null;
        if (seed === null) result = iter.next().value; // what about empty iterables?
        else result = func(seed, iter.next().value);
        for (let v of iter) result = func(result, v);
        return result;
    }

    any() {
        let predicate = arguments.length <= 0 || arguments[0] === undefined ? _zanaCheck2.default.exists : arguments[0];

        for (let v of this) {
            if (predicate(v)) return true;
        }
        return false;
    }

    at(index) {
        if (_zanaCheck2.default.instance(this.data, Array)) return this.data[index];
        for (let v of this) {
            if (index-- === 0) return v;
        }
    }

    average() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let len = this.length();
        if (len === 0) return NaN;
        return this.sum(selector) / len;
    }

    concat() {
        let iters = [this.data];

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        for (let arg of args) {
            if (arg instanceof Iterable) // a bit hacky... but functional. need to make sure we can use iter1.concat(iter1)
                iters.push(arg.data);else iters.push(arg);
        }
        return new Iterable(function* () {
            for (let iter of iters) {
                for (let v of expand(iter)) yield v;
            }
        });
    }

    contains(item) {
        return this.any(x => _zanaUtil2.default.equals(x, item));
    }

    distinct() {
        let hasher = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            let seen = new Set();
            for (let v of expand(prev)) {
                let selected = hasher(v);
                if (!seen.has(selected)) {
                    seen.add(selected);
                    yield v;
                }
            }
        });
    }

    empty() {
        return !this.any(x => !_zanaCheck2.default.empty(x));
    }

    every() {
        let predicate = arguments.length <= 0 || arguments[0] === undefined ? _zanaCheck2.default.empty : arguments[0];

        for (let v of this) {
            if (!predicate(v)) return false;
        }
        return true;
    }

    first() {
        let predicate = arguments.length <= 0 || arguments[0] === undefined ? _zanaCheck2.default.exists : arguments[0];

        for (let v of this) {
            if (predicate(v)) return v;
        }
        return undefined;
    }

    firstOrDefault() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        let def = args.pop();
        let predicate = args.pop(); // fine if undefined. #first() will provide a default predicate.
        let first = this.first(predicate);
        if (first === undefined) return def;
        return first;
    }

    flatten() {
        let prev = this.data;
        this.data = _flatten(prev);
        return this;
    }

    full() {
        return !this.any(x => _zanaCheck2.default.empty(x));
    }

    group() {
        let keySelector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            let expanded = expand(prev);
            let groups = new Map();
            for (let element of expanded) {
                let key = keySelector(element);
                if (!groups.has(key)) groups.set(key, []);
                let group = groups.get(key);
                group.push(element);
            }
            for (let _ref2 of groups) {
                var _ref3 = _slicedToArray(_ref2, 2);

                let key = _ref3[0];
                let arr = _ref3[1];

                yield new GroupedIterable(key, arr);
            }
        });
    }

    intersect(iter) {
        let hasher = arguments.length <= 1 || arguments[1] === undefined ? x => x : arguments[1];

        let prev = this.data;
        return new Iterable(function* () {
            let set = new Set(Iterable.from(iter).select(hasher).toArray());
            for (let v of expand(prev)) {
                let selected = hasher(v);
                if (set.delete(selected)) yield v;
            }
        });
    }

    join() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return new MultiIterable(this, ...args);
    }

    last() {
        let predicate = arguments.length <= 0 || arguments[0] === undefined ? _zanaCheck2.default.exists : arguments[0];

        if (_zanaCheck2.default.type(this.data, _zanaUtil.types.array)) {
            if (predicate instanceof Function) {
                for (let i = this.data.length; i >= 0; i--) {
                    let v = this.data[i];
                    if (predicate(v)) return v;
                }
            } else return this.data[this.data.length - 1];
        } else {
            // we could also take the easy way out and just convert
            // this.data to an array if it isn't already an array.

            // would use more memory, but GC should pick it up
            // immediately after the function anyways,
            // and would immensely simplify the logic here.

            let current,
                previous,
                result,
                expanded = expand(this.data);
            if (_zanaCheck2.default.instance(predicate, Function)) {
                while (!(current = expanded.next()).done) {
                    if (predicate(current.value)) result = current.value;
                }
            } else {
                while (!(current = expanded.next()).done) previous = current; // or we could just assign result = a.value -- could be less efficient.
                result = previous.value; // current will step "past" the end. previous will be the final.
            }
            return result;
        }
        return undefined;
    }

    lastOrDefault() {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        let def = args.pop();
        let predicate = args.pop(); // fine if undefined. #last() will provide a default predicate.
        let last = this.last(predicate);
        if (last === undefined) return def;
        return last;
    }

    length() {
        // shortcut if we have length defined -- do we want to give sets/maps (`size`) the same treatment?
        if (this.data.length && _zanaCheck2.default.type(this.data.length, _zanaUtil.types.number)) return this.data.length;
        let len = 0;
        let expanded = expand(this.data)[Symbol.iterator]();
        while (!expanded.next().done) len++;
        return len;
    }

    max() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let max;
        for (let v of this) {
            let num = selector(v);
            if (_zanaCheck2.default.type(num, _zanaUtil.types.number) && (max === undefined || num > max)) max = num;
        }
        return max;
    }

    min() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let min;
        for (let v of this) {
            let num = selector(v);
            if (_zanaCheck2.default.type(num, _zanaUtil.types.number) && (min === undefined || num < min)) min = num;
        }
        return min;
    }

    orderBy() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];
        let comparer = arguments.length <= 1 || arguments[1] === undefined ? (x, y) => x > y ? 1 : x < y ? -1 : 0 : arguments[1];
        let descending = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        return new OrderedIterable(this, selector, comparer, descending);
    }

    orderByDescending() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];
        let comparer = arguments.length <= 1 || arguments[1] === undefined ? (x, y) => x > y ? 1 : x < y ? -1 : 0 : arguments[1];

        return new OrderedIterable(this, selector, comparer, true);
    }

    reverse() {
        let prev = this.data;
        return new Iterable(function* () {
            let expanded = expand(prev)[Symbol.iterator]();
            yield* reverse(expanded, expanded.next());
        });
    }

    select() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            for (let v of expand(prev)) yield selector(v);
        });
    }

    skip() {
        let count = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            let a,
                i = 0,
                expanded = expand(prev)[Symbol.iterator]();
            while (!(a = expanded.next()).done && i < count) i++;
            if (!a.done) {
                yield a.value;
                while (!(a = expanded.next()).done) yield a.value;
            }
        });
    }

    sum() {
        let selector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let sum = 0;
        for (let v of this) {
            let num = selector(v);
            if (_zanaCheck2.default.type(num, _zanaUtil.types.number)) sum += num;
        }
        return sum;
    }

    take() {
        let count = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            let i = 0;
            for (let v of expand(prev)) {
                if (count <= i++) break;
                yield v;
            }
        });
    }

    toArray() {
        //// option 1
        // return Array.from(this);

        // option 2
        if (Array.isArray(this.data)) return this.data;
        return [...this];

        //// option 3
        // let arr = [];
        // for (let v of this)
        //     arr.push(v);
        // return arr;
    }

    where() {
        let predicate = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            for (let v of expand(prev)) {
                if (predicate(v)) yield v;
            }
        });
    }

    while() {
        let predicate = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];

        let prev = this.data;
        return new Iterable(function* () {
            for (var v of expand(prev)) {
                if (!predicate(v)) break;
                yield v;
            }
        });
    }

    zip(iter) {
        let selector = arguments.length <= 1 || arguments[1] === undefined ? (x, y) => (0, _zanaUtil.extend)(x, y) : arguments[1];

        let prev = this.data;
        return new Iterable(function* () {
            let aIter = expand(prev)[Symbol.iterator]();
            let bIter = expand(iter)[Symbol.iterator]();
            let a, b;
            while (!(a = aIter.next()).done && !(b = bIter.next()).done) yield selector(a.value, b.value);
        });
    }
}

exports.default = Iterable;
Iterable.wrap = Iterable.iter;
Iterable.from = Iterable.iter;
Iterable.prototype.filter = Iterable.prototype.where;
Iterable.prototype.groupBy = Iterable.prototype.group;
Iterable.prototype.map = Iterable.prototype.select;
Iterable.prototype.merge = Iterable.prototype.zip;
Iterable.prototype.reduce = Iterable.prototype.aggregate;
Iterable.prototype.takeWhile = Iterable.prototype.while;
Iterable.prototype.union = Iterable.prototype.concat;
Iterable.prototype.unique = Iterable.prototype.distinct;

class GroupedIterable extends Iterable {

    constructor(key, data) {
        super(data);
        this.key = key;
    }

    get [Symbol.toStringTag]() {
        return 'GroupedIterable';
    }
}

exports.GroupedIterable = GroupedIterable;
class MultiIterable extends Iterable {

    constructor() {
        super();

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        this.iterables = [...args];
        let self = this; // since we cant use arrow functions or bind with generators
        this.data = function* () {
            let expanded = [];
            for (let iter of self.iterables) expanded.push(Array.from(expand(iter))); // convert to array off the top, since we will have to iterate back and forth
            function* iterate(index, accumulate) {
                if (accumulate.length < expanded.length) {
                    for (let v of expanded[index]) {
                        accumulate.push(v);
                        yield* iterate(index + 1, accumulate);
                    }
                } else yield Array.from(accumulate); // make a copy
                accumulate.pop(); // base and recursive case both need to pop
            }
            yield* iterate(0, []);
        };
    }

    get [Symbol.toStringTag]() {
        return 'MultiIterable';
    }

    join() {
        for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            args[_key7] = arguments[_key7];
        }

        return new MultiIterable(...this.iterables, ...args);
    }
}

exports.MultiIterable = MultiIterable;
class OrderedIterable extends Iterable {

    constructor(data) {
        let selector = arguments.length <= 1 || arguments[1] === undefined ? x => x : arguments[1];
        let comparer = arguments.length <= 2 || arguments[2] === undefined ? (x, y) => x > y ? 1 : x < y ? -1 : 0 : arguments[2];
        let descending = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        super(data);
        this.selector = selector;
        this.comparer = (x, y) => {
            let result = comparer(x, y);
            return descending ? -result : result;
        };
        let prev = data;
        let self = this;
        this.data = function* () {
            let expanded = expand(prev);
            let elements = [...expanded];
            let unsortedElements = elements.filter(x => self.selector(x) == null);
            let unsortedCount = unsortedElements.length;
            let sortableElements = elements.filter(x => self.selector(x) != null);
            let sortedCount = sortableElements.length;
            let sortedKeys = buildKeyArray(sortableElements, self.selector, sortedCount);
            let sortedMap = buildMapArray(sortedCount);

            // todo: something with descending.
            quicksort(sortedKeys, sortedMap, self.comparer, 0, sortedCount - 1);
            for (let i = 0; i < sortedCount; i++) yield sortableElements[sortedMap[i]];
            for (let i = 0; i < unsortedCount; i++) yield unsortedElements[i];
        };
    }

    get [Symbol.toStringTag]() {
        return 'OrderedIterable';
    }

    thenBy() {
        let newSelector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];
        let newComparer = arguments.length <= 1 || arguments[1] === undefined ? (x, y) => x > y ? 1 : x < y ? -1 : 0 : arguments[1];
        let descending = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        // wrap the old selector in a new selector function
        // which will build all keys into a primary/secondary structure,
        // allowing the primary key selector to grow recursively
        // by appending new selectors on to the original selectors
        let oldSelector = this.selector; // store pointer to avoid accidental recursion
        let compositeSelector = item => {
            return {
                primary: oldSelector(item),
                secondary: newSelector(item)
            };
        };

        // wrap the old comparer in a new comparer function
        // which will carry on down the line of comparers
        // in order until a non-zero is found,
        // or until we reach the last comparer
        let oldComparer = this.comparer; // store pointer to avoid accidental recursion
        let compositeComparer = (compoundKeyA, compoundKeyB) => {
            let result = oldComparer(compoundKeyA.primary, compoundKeyB.primary);
            if (result === 0) {
                // ensure stability
                let newResult = newComparer(compoundKeyA.secondary, compoundKeyB.secondary);
                return descending ? -newResult : newResult;
            }
            return result;
        };

        return new OrderedIterable(this.data, compositeSelector, compositeComparer, false // compositeComparer already contains the flip, don't use it twice
        );
    }

    thenByDescending() {
        let newSelector = arguments.length <= 0 || arguments[0] === undefined ? x => x : arguments[0];
        let newComparer = arguments.length <= 1 || arguments[1] === undefined ? (x, y) => x > y ? 1 : x < y ? -1 : 0 : arguments[1];

        return this.thenBy(newSelector, newComparer, true);
    }
}

exports.OrderedIterable = OrderedIterable;
var iter = exports.iter = Iterable.iter;
var from = exports.from = Iterable.from;
var wrap = exports.wrap = Iterable.wrap;