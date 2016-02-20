/* eslint no-use-before-define: 0 */

/*
    @license
    Copyright (C) 2016 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

import util, { extend, types } from 'zana-util';
import check from 'zana-check';

// const DATA = Symbol('data'); // swap this.data to use DATA instead

function buildMapArray(count) {
    let mapArray = new Array(count);
    for (let i = 0; i < count; i++)
        mapArray[i] = i;
    return mapArray;
}

function buildKeyArray(elements, selector, count) {
    let keyArray = new Array(count);
    for (let i = 0; i < count; i++)
        keyArray[i] = selector(elements[i]);
    return keyArray;
}

function compareKeys(comparer, keys, i1, i2) {
    let k1 = keys[i1];
    let k2 = keys[i2];
    let c = comparer(k1, k2);
    if (c === 0)
        return i1 - i2;
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
        let x = map[i + ((j - i) >> 1)];
        do {
            while (i < map.length && compareKeys(comparer, keys, x, map[i]) > 0)
                i++;
            while (j >= 0 && compareKeys(comparer, keys, x, map[j]) < 0)
                j--;
            if (i > j)
                break; // left index has crossed right index, stop the loop
            if (i < j)
                [map[i], map[j]] = [map[j], map[i]];
            i++;
            j--;
        } while (i <= j);
        if (j - left <= right - i) {
            if (left < j)
                quicksort(keys, map, comparer, left, j);
            left = i;
        }
        else {
            if (i < right)
                quicksort(keys, map, comparer, i, right);
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
    return function*() {
        let prev = expand(item);
        if (!check.isIterable(prev))
            yield prev;
        else {
            for (let v of prev) {
                if (!check.isIterable(v) && !check.instance(v, Function))
                    yield v;
                else
                    yield* expand(_flatten(v));
            }
        }
    };
}

export default class Iterable {
    constructor(data) {
        this.data = data || [];
    }

    static empty() {
        return new Iterable([]);
    }

    static iter(...args) {
        if (args.length === 1)
            return new Iterable(args[0]);
        else if (args.length > 1)
            return new MultiIterable(...args);
        else
            return Iterable.empty();
    }

    get [Symbol.toStringTag]() {
        return 'Iterable';
    }

    [Symbol.iterator]() {
        return expand(this.data)[Symbol.iterator](); // covers arrays, sets, generator functions, generators..
    }

    aggregate(
          func = x => x
        , seed = null
    ) {
        let iter = this[Symbol.iterator]();
        let result = null;
        if (seed === null)
            result = iter.next().value; // what about empty iterables?
        else
            result = func(seed, iter.next().value);
        for (let v of iter)
            result = func(result, v);
        return result;
    }

    any(predicate = check.exists) {
        for (let v of this) {
            if (predicate(v))
                return true;
        }
        return false;
    }

    at(index) {
        if (check.instance(this.data, Array))
            return this.data[index];
        for (let v of this) {
            if (index-- === 0)
                return v;
        }
    }

    average(selector = x => x) {
        let len = this.length();
        if (len === 0)
            return NaN;
        return this.sum(selector) / len;
    }

    concat(...args) {
        let iters = [this.data];
        for (let arg of args) {
            if (arg instanceof Iterable) // a bit hacky... but functional. need to make sure we can use iter1.concat(iter1)
                iters.push(arg.data);
            else
                iters.push(arg);
        }
        return new Iterable(function*() {
            for (let iter of iters) {
                for (let v of expand(iter))
                    yield v;
            }
        });
    }

    contains(item) {
        return this.any(x => util.equals(x, item));
    }

    distinct(hasher = x => x) {
        let prev = this.data;
        return new Iterable(function*() {
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
        return !this.any(x => !check.empty(x));
    }

    every(predicate = check.exists) {
        for (let v of this) {
            if (!predicate(v))
                return false;
        }
        return true;
    }

    first(predicate = check.exists) {
        for (let v of this) {
            if (predicate(v))
                return v;
        }
        return undefined;
    }

    firstOrDefault(...args) {
        let def = args.pop();
        let predicate = args.pop(); // fine if undefined. #first() will provide a default predicate.
        let first = this.first(predicate);
        if (first === undefined)
            return def;
        return first;
    }

    flatten() {
        let prev = this.data;
        this.data = _flatten(prev);
        return this;
    }

    full() {
        return !this.any(x => check.empty(x));
    }

    group(keySelector = x => x) {
        let prev = this.data;
        return new Iterable(function*() {
            let expanded = expand(prev);
            let groups = new Map();
            for (let element of expanded) {
                let key = keySelector(element);
                if (!groups.has(key))
                    groups.set(key, []);
                let group = groups.get(key);
                group.push(element);
            }
            for (let [ key, arr ] of groups)
                yield new GroupedIterable(key, arr);
        });
    }

    intersect(iter, hasher = x => x) {
        let prev = this.data;
        return new Iterable(function*() {
            let set = new Set(Iterable.from(iter).select(hasher).toArray());
            for (let v of expand(prev)) {
                let selected = hasher(v);
                if (set.delete(selected))
                    yield v;
            }
        });
    }

    join(...args) {
        return new MultiIterable(this, ...args);
    }

    last(predicate = check.exists) {
        if (check.type(this.data, types.array)) {
            if (predicate instanceof Function) {
                for (let i = this.data.length; i >= 0; i--) {
                    let v = this.data[i];
                    if (predicate(v))
                        return v;
                }
            }
            else
                return this.data[ this.data.length - 1 ];
        }
        else {
            // we could also take the easy way out and just convert
            // this.data to an array if it isn't already an array.

            // would use more memory, but GC should pick it up
            // immediately after the function anyways,
            // and would immensely simplify the logic here.

            let current,
                previous,
                result,
                expanded = expand(this.data);
            if (check.instance(predicate, Function)) {
                while (!(current = expanded.next()).done) {
                    if (predicate(current.value))
                        result = current.value;
                }
            }
            else {
                while (!(current = expanded.next()).done)
                    previous = current; // or we could just assign result = a.value -- could be less efficient.
                result = previous.value; // current will step "past" the end. previous will be the final.
            }
            return result;
        }
        return undefined;
    }

    lastOrDefault(...args) {
        let def = args.pop();
        let predicate = args.pop(); // fine if undefined. #last() will provide a default predicate.
        let last = this.last(predicate);
        if (last === undefined)
            return def;
        return last;
    }

    length() {
        // shortcut if we have length defined -- do we want to give sets/maps (`size`) the same treatment?
        if (this.data.length && check.type(this.data.length, types.number))
            return this.data.length;
        let len = 0;
        let expanded = expand(this.data)[Symbol.iterator]();
        while (!(expanded.next()).done)
            len++;
        return len;
    }

    max(selector = x => x) {
        let max;
        for (let v of this) {
            let num = selector(v);
            if (check.type(num, types.number) && (max === undefined || num > max))
                max = num;
        }
        return max;
    }

    min(selector = x => x) {
        let min;
        for (let v of this) {
            let num = selector(v);
            if (check.type(num, types.number) && (min === undefined || num < min))
                min = num;
        }
        return min;
    }

    orderBy(
          selector   = (x)    => x
        , comparer   = (x, y) => x > y ? 1 : x < y ? -1 : 0
        , descending = false
    ) {
        return new OrderedIterable(this, selector, comparer, descending);
    }

    orderByDescending(
          selector = (x)    => x
        , comparer = (x, y) => x > y ? 1 : x < y ? -1 : 0
    ) {
        return new OrderedIterable(this, selector, comparer, true);
    }

    reverse() {
        let prev = this.data;
        return new Iterable(function*() {
            let expanded = expand(prev)[Symbol.iterator]();
            yield* reverse(expanded, expanded.next());
        });
    }

    select(selector = x => x) {
        let prev = this.data;
        return new Iterable(function*() {
            for (let v of expand(prev))
                yield selector(v);
        });
    }

    skip(count = 1) {
        let prev = this.data;
        return new Iterable(function*() {
            let a,
                i = 0,
                expanded = expand(prev)[Symbol.iterator]();
            while (!(a = expanded.next()).done && i < count)
                i++;
            if (!a.done) {
                yield a.value;
                while(!(a = expanded.next()).done)
                    yield a.value;
            }
        });
    }

    sum(selector = x => x) {
        let sum = 0;
        for (let v of this) {
            let num = selector(v);
            if (check.type(num, types.number))
                sum += num;
        }
        return sum;
    }

    take(count = 1) {
        let prev = this.data;
        return new Iterable(function*() {
            let i = 0;
            for (let v of expand(prev)) {
                if (count <= i++)
                    break;
                yield v;
            }
        });
    }

    toArray() {
        //// option 1
        // return Array.from(this);

        // option 2
        if (Array.isArray(this.data))
            return this.data;
        return [...this];

        //// option 3
        // let arr = [];
        // for (let v of this)
        //     arr.push(v);
        // return arr;
    }

    unwind(selector = x => x) {
        let prev = this.data;
        return new Iterable(function*() {
            for (let v of expand(prev)) {
                let unwinding = new Iterable(selector(v));
                let multi = new MultiIterable([ v ], unwinding);
                yield* multi;
            }
        });
    }

    where(predicate = check.exists) {
        let prev = this.data;
        return new Iterable(function*() {
            for (let v of expand(prev)) {
                if (predicate(v))
                    yield v;
            }
        });
    }

    while(predicate = check.exists) {
        let prev = this.data;
        return new Iterable(function*() {
            for (var v of expand(prev)) {
                if (!predicate(v))
                    break;
                yield v;
            }
        });
    }

    zip(
          iter
        , selector = (x, y) => extend(x, y)
    ) {
        let prev = this.data;
        return new Iterable(function*() {
            let aIter = expand(prev)[Symbol.iterator]();
            let bIter = expand(iter)[Symbol.iterator]();
            let a, b;
            while (!(a = aIter.next()).done && !(b = bIter.next()).done)
                yield selector(a.value, b.value);
        });
    }
}

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

export class GroupedIterable extends Iterable {

    constructor(key, data) {
        super(data);
        this.key = key;
    }

    get [Symbol.toStringTag]() {
        return 'GroupedIterable';
    }
}

export class MultiIterable extends Iterable {

    constructor(...args) {
        super();
        this.iterables = [...args];
        let self = this; // since we cant use arrow functions or bind with generators
        this.data = function*() {
            let expanded = [];
            for (let iter of self.iterables)
                expanded.push(Array.from(expand(iter))); // convert to array off the top, since we will have to iterate back and forth
            function* iterate(index, accumulate) {
                if (accumulate.length < expanded.length) {
                    for (let v of expanded[index]) {
                        accumulate.push(v);
                        yield* iterate(index + 1, accumulate);
                    }
                }
                else
                    yield Array.from(accumulate); // make a copy
                accumulate.pop(); // base and recursive case both need to pop
            }
            yield* iterate(0, []);
        };
    }

    get [Symbol.toStringTag]() {
        return 'MultiIterable';
    }

    join(...args) {
        return new MultiIterable(...this.iterables, ...args);
    }
}

export class OrderedIterable extends Iterable {

    constructor(
          data
        , selector   = (x)    => x
        , comparer   = (x, y) => x > y ? 1 : x < y ? -1 : 0
        , descending = false
    ) {
        super(data);
        this.selector = selector;
        this.comparer = (x, y) => {
            let result = comparer(x, y);
            return (descending ? -result : result);
        };
        let prev = data;
        let self = this;
        this.data = function*() {
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
            for (let i = 0; i < sortedCount; i++)
                yield sortableElements[sortedMap[i]];
            for (let i = 0; i < unsortedCount; i++)
                yield unsortedElements[i];
        };
    }

    get [Symbol.toStringTag]() {
        return 'OrderedIterable';
    }

    thenBy(
          newSelector = (x)    => x
        , newComparer = (x, y) => (x > y ? 1 : x < y ? -1 : 0)
        , descending  = false
    ) {
        // wrap the old selector in a new selector function
        // which will build all keys into a primary/secondary structure,
        // allowing the primary key selector to grow recursively
        // by appending new selectors on to the original selectors
        let oldSelector = this.selector; // store pointer to avoid accidental recursion
        let compositeSelector = item => {
            return {
                primary   : oldSelector(item),
                secondary : newSelector(item)
            };
        };

        // wrap the old comparer in a new comparer function
        // which will carry on down the line of comparers
        // in order until a non-zero is found,
        // or until we reach the last comparer
        let oldComparer = this.comparer; // store pointer to avoid accidental recursion
        let compositeComparer = (compoundKeyA, compoundKeyB) => {
            let result = oldComparer(compoundKeyA.primary, compoundKeyB.primary);
            if (result === 0) { // ensure stability
                let newResult = newComparer(compoundKeyA.secondary, compoundKeyB.secondary);
                return (descending ? -newResult : newResult);
            }
            return result;
        };

        return new OrderedIterable(
              this.data
            , compositeSelector
            , compositeComparer
            , false // compositeComparer already contains the flip, don't use it twice
        );
    }

    thenByDescending(
          newSelector = (x)    => x
        , newComparer = (x, y) => (x > y ? 1 : x < y ? -1 : 0)
    ) {
        return this.thenBy(newSelector, newComparer, true);
    }
}

export var iter = Iterable.iter;
export var from = Iterable.from;
export var wrap = Iterable.wrap;
