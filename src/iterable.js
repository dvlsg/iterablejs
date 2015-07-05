/* eslint no-use-before-define: 0 */

/*
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

import util, { extend, types } from 'zana-util';
import check from 'zana-check';

// const DATA = Symbol('data'); // swap this.data to use DATA instead
// let log = ::console.log;

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

// function quicksort3(keyArray, mapArray, comparer, left, right) {
//     let indexForLessThan    = left;
//     let indexForGreaterThan = right;
//     let pivotIndex          = mapArray[left];
//     let indexForIterator    = left + 1;
//     while (indexForIterator <= indexForGreaterThan) {
//         let cmp = comparer(keyArray[mapArray[indexForIterator]], keyArray[pivotIndex], mapArray[indexForIterator], mapArray[pivotIndex]);
//         if (cmp < 0)
//             swap(mapArray, indexForLessThan++, indexForIterator++);
//         else if (cmp > 0)
//             swap(mapArray, indexForIterator, indexForGreaterThan--);
//         else
//             indexForIterator++;
//     }
//     if (left < indexForLessThan - 1)
//         quicksort3(keyArray, mapArray, comparer, left, indexForLessThan - 1);
//     if (indexForGreaterThan + 1 < right)
//         quicksort3(keyArray, mapArray, comparer, indexForGreaterThan + 1, right);
// }

function compareKeys(comparer, keys, i1, i2) {
    let k1 = keys[i1];
    let k2 = keys[i2];
    let c = comparer(k1, k2);
    if (c === 0)
        return i1 - i2;
    return c;
}

function quicksort(keys, map, comparer, left, right) {
    do {
        let i = left;
        let j = right;
        let x = map[i + ((j - i) >> 1)];
        // let p = keys[x];
        do {
            while (i < map.length && compareKeys(comparer, keys, x, map[i]) > 0)
                i++;
            while (j >= 0 && compareKeys(comparer, keys, x, map[j]) < 0)
                j--;
            if (i > j)
                break; // left index has crossed right index, stop the loop
            if (i < j)
                [map[i], map[j]] = [map[j], map[i]]; // does this work?
                // swap(map, i, j); // swap the indexes in the map
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
        let prev = Iterable.expand(item);
        if (!check.isIterable(prev))
            yield prev;
        else {
            for (let v of prev) {
                if (!check.isIterable(v) && !check.instance(v, Function))
                    yield v;
                else
                    yield* Iterable.expand(_flatten(v));
            }
        }
    };
}

export default class Iterable {
    data: any;

    constructor(data) {
        this.data = data || [];
    }

    static empty() {
        return new Iterable([]);
    }

    static expand(iter: any) {
        if (iter && typeof iter === 'function') // could be mishandled. throw an error if iter() doesn't have [Symbol.iterator] defined?
            return iter();
        return iter;
    }

    static from(...args) {
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
        return Iterable.expand(this.data)[Symbol.iterator](); // covers arrays, sets, generator functions, generators..
    }

    aggregate(
          func: Function = (x) => x
        , seed: any = null
    ): any {
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

    any(
        predicate : Function = check.exists
    ): Boolean {
        for (let v of this) {
            if (predicate(v))
                return true;
        }
        return false;
    }

    at(index: Number): any {
        if (check.instance(this.data, Array))
            return this.data[index];
        for (let v of this) {
            if (index-- === 0)
                return v;
        }
    }

    average(
        selector : Function = x => x
    ): Number {
        let len = this.length();
        if (len === 0)
            return len;
        return this.sum(selector) / len;
    }

    concat(...args): Iterable {
        let iters = [this.data];
        for (let arg of args) {
            if (arg instanceof Iterable) // a bit hacky... but functional. need to make sure we can use iter1.concat(iter1)
                iters.push(arg.data);
            else
                iters.push(arg);
        }
        this.data = function*() {
            for (let iter of iters) {
                for (let v of Iterable.expand(iter))
                    yield v;
            }
        };
        return this;
    }

    contains(
          item     : any
        , selector : Function = x => x
    ): Boolean {
        let comparer;
        if (check.instance(item, Function))
            comparer = x => item(x);
        else
            comparer = util.equals;
        for (let v of this) {
            if (comparer(selector(v), item))
                return true;
        }
        return false;
    }

    distinct(
        selector : Function = x => x
    ): Iterable {
        let prev = this.data;
        this.data = function*() {
            let seen = new Set();
            for (let v of Iterable.expand(prev)) {
                let selected = selector(v);
                if (!seen.has(selected)) {
                    seen.add(selected);
                    yield v;
                }
            }
        };
        return this;
    }

    empty(): Boolean {
        return !this.any(x => !check.empty(x));
    }

    every(
        predicate : Function = check.empty
    ): Boolean {
        for (let v of this) {
            if (!predicate(v))
                return false;
        }
        return true;
    }

    first(
        predicate : Function = check.exists
    ): any {
        for (let v of this) {
            if (predicate(v))
                return v;
        }
        return undefined;
    }

    flatten(): Iterable {
        let prev = this.data;
        this.data = _flatten(prev);
        return this;
    }

    full(): Boolean {
        return !this.any(x => check.empty(x));
    }

    intersect(
          iter     : any
        , selector : Function = x => x
    ): Iterable {
        let prev = this.data;
        this.data = function*() {
            let set = new Set(Iterable.from(iter).select(selector).toArray());
            for (let v of Iterable.expand(prev)) {
                let selected = selector(v);
                if (set.delete(selected))
                    yield v;
            }
        };
        return this;
    }

    join(...args): MultiIterable {
        return new MultiIterable(this, ...args);
    }

    last(
        predicate : Function
    ): any {
        if (check.type(this.data, types.array)) {
            if (check.instance(predicate, Function)) {
                for (let i = this.data.length; i >= 0; i--) {
                    let v = this.data[i];
                    if (predicate(v))
                        return v;
                }
            }
            else
                return this.data[this.data.length - 1];
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
                expanded = Iterable.expand(this.data);
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

    length(): Number {
        // shortcut if we have length defined -- do we want to give sets/maps (`size`) the same treatment?
        if (this.data.length && check.type(this.data.length, types.number))
            return this.data.length;
        let len = 0;
        let expanded = Iterable.expand(this.data)[Symbol.iterator]();
        while (!(expanded.next()).done)
            len++;
        return len;
    }

    max(
        selector : Function = x => x
    ): Number {
        let max;
        for (let v of this) {
            let num = selector(v);
            if (check.type(num, types.number) && (max === undefined || num > max))
                max = num;
        }
        return max;
    }

    min(
        selector : Function = x => x
    ): Number {
        let min;
        for (let v of this) {
            let num = selector(v);
            if (check.type(num, types.number) && (min === undefined || num < min))
                min = num;
        }
        return min;
    }

    orderBy(
          selector   : Function = (x)    => x
        , comparer   : Function = (x, y) => x > y ? 1 : x < y ? -1 : 0
        , descending : boolean  = false
    ): OrderedIterable
    {
        return new OrderedIterable(this, selector, comparer, descending);
    }

    orderByDescending(
          selector : Function = (x)    => x
        , comparer : Function = (x, y) => x > y ? 1 : x < y ? -1 : 0
    ): OrderedIterable
    {
        return new OrderedIterable(this, selector, comparer, true);
    }

    reverse(): Iterable {
        let prev = this.data;
        this.data = function*() {
            let expanded = Iterable.expand(prev)[Symbol.iterator]();
            yield* reverse(expanded, expanded.next());
        };
        return this;
    }

    select(selector: Function = (x) => x): Iterable {
        let prev = this.data;
        this.data = function*() {
            for (let v of Iterable.expand(prev))
                yield selector(v);
        };
        return this;
    }

    skip(count: Number = 1): Iterable {
        let prev = this.data;
        this.data = function*() {
            let a,
                i = 0,
                expanded = Iterable.expand(prev)[Symbol.iterator]();
            while (!(a = expanded.next()).done && i < count)
                i++;
            if (!a.done) {
                yield a.value;
                while(!(a = expanded.next()).done)
                    yield a.value;
            }
        };
        return this;
    }

    sum(
        selector : Function = x => x
    ): Number {
        let sum = 0;
        for (let v of this) {
            let num = selector(v);
            if (check.type(num, types.number))
                sum += num;
        }
        return sum;
    }

    take(count: Number = 1): Iterable {
        let prev = this.data;
        this.data = function*() {
            let i = 0;
            for (let v of Iterable.expand(prev)) {
                if (count <= i++)
                    break;
                yield v;
            }
        };
        return this;
    }

    toArray(): Array<any> {
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

    where(predicate: Function = (x) => x): Iterable {
        let prev = this.data;
        this.data = function*() {
            for (let v of Iterable.expand(prev)) {
                if (predicate(v))
                    yield v;
            }
        };
        return this;
    }

    while(predicate: Function = x => x): Iterable {
        let prev = this.data;
        this.data = function*() {
            for (var v of Iterable.expand(prev)) {
                if (!predicate(v))
                    break;
                yield v;
            }
        };
        return this;
    }

    zip(
          iter     : any
        , selector : Function = (x, y) => extend(x, y)
    ): Iterable {
        let prev = this.data;
        this.data = function*() {
            let aIter = Iterable.expand(prev)[Symbol.iterator]();
            let bIter = Iterable.expand(iter)[Symbol.iterator]();
            let a, b;
            while (!(a = aIter.next()).done && !(b = bIter.next()).done)
                yield selector(a.value, b.value);
        };
        return this;
    }
}

Iterable.wrap = Iterable.from;
Iterable.prototype.filter = Iterable.prototype.where;
Iterable.prototype.map = Iterable.prototype.select;
Iterable.prototype.merge = Iterable.prototype.zip;
Iterable.prototype.takeWhile = Iterable.prototype.while;
Iterable.prototype.union = Iterable.prototype.concat;

export class MultiIterable extends Iterable {

    iterables: Array<Iterable>;

    constructor(...args) {
        super();
        this.iterables = [];
        this.join(...args);
        let self = this; // since we cant use arrow functions or bind with generators
        this.data = function*() {
            let expanded = [];
            for (let iter of self.iterables)
                expanded.push(Array.from(Iterable.expand(iter))); // convert to array off the top, since we will have to iterate back and forth
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
        for (let v of args)
            this.iterables.push(v);
        return this;
    }
}

export class OrderedIterable extends Iterable {

    comparer   : Function;
    selector   : Function;
    descending : boolean;

    constructor(
          data       : any
        , selector   : Function = (x)    => x
        , comparer   : Function = (x, y) => x > y ? 1 : x < y ? -1 : 0
        , descending : boolean  = false
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
            let expanded = Iterable.expand(prev);
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
          newSelector : Function = (x)    => x
        , newComparer : Function = (x, y) => (x > y ? 1 : x < y ? -1 : 0)
        , descending  : Boolean  = false
    ): OrderedIterable {

        // wrap the old selector in a new selector function
        // which will build all keys into a primary/secondary structure,
        // allowing the primary key selector to grow recursively
        // by appending new selectors on to the original selectors
        let oldSelector = this.selector; // store pointer to avoid accidental recursion
        this.selector = function(item) {
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
        this.comparer = function(compoundKeyA, compoundKeyB) {
            let result = oldComparer(compoundKeyA.primary, compoundKeyB.primary);
            if (result === 0) { // ensure stability
                let newResult = newComparer(compoundKeyA.secondary, compoundKeyB.secondary);
                return (descending ? -newResult : newResult);
            }
            return result;
        };
        return this;
    }

    thenByDescending(
          newSelector: Function = (x)    => x
        , newComparer: Function = (x, y) => (x > y ? 1 : x < y ? -1 : 0)
    ): OrderedIterable {
        return this.thenBy(newSelector, newComparer, true);
    }
}

export var from = Iterable.from;
export var wrap = Iterable.wrap;
