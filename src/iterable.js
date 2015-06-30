/* eslint no-unused-vars: 0 */
/* eslint no-trailing-spaces: 0 */
/* eslint no-use-before-define: 0 */

/*
    @license
    Copyright (C) 2014 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

import util from 'zana-util';
import check from 'zana-check';

let slice = Array.prototype.slice;
let die = process.exit.bind(process);

const DATA = Symbol('data'); // swap this.data to use DATA instead
const log = ::console.log;

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

function quicksort3(keyArray, mapArray, comparer, left, right) {
    let indexForLessThan    = left;
    let indexForGreaterThan = right;
    let pivotIndex          = mapArray[left];
    let indexForIterator    = left + 1;
    while (indexForIterator <= indexForGreaterThan) {
        let cmp = comparer(keyArray[mapArray[indexForIterator]], keyArray[pivotIndex], mapArray[indexForIterator], mapArray[pivotIndex]);
        if (cmp < 0)
            swap(mapArray, indexForLessThan++, indexForIterator++);
        else if (cmp > 0)
            swap(mapArray, indexForIterator, indexForGreaterThan--);
        else
            indexForIterator++;
    }
    if (left < indexForLessThan - 1)
        quicksort3(keyArray, mapArray, comparer, left, indexForLessThan - 1);
    if (indexForGreaterThan + 1 < right)
        quicksort3(keyArray, mapArray, comparer, indexForGreaterThan + 1, right);
}

function compareKeys(comparer, keys, i1, i2) {
    let k1 = keys[i1];
    let k2 = keys[i2];
    let c = comparer(k1, k2);
    if (c === 0)
        return i1 - i2;
    return c;
}

function swap(arr, a, b) {
    [arr[a], arr[b]] = [arr[b], arr[a]];
}

function quicksort(keys, map, comparer, left, right) {
    do {
        let i = left;
        let j = right;
        let x = map[i + ((j - i) >> 1)];
        let p = keys[x];
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
function* _flatten(expanded) {
    if (!check.isIterable(expanded))
        yield expanded;
    else {
        for (let v of expanded) {
            let e = Iterable.expand(v);
            if (!check.isIterable(e))
                yield e;
            else
                yield* _flatten(e);
        }
    }
}

export default class Iterable {
    data: any;

    constructor(data) {
        this.data = data;
    }

    static empty() {
        return new Iterable([]);
    }

    static expand(iter: any) {
        if (iter && typeof iter === 'function') // really need typeof generatorFunction..
            return iter();
        return iter;
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

    at(index: Number): any {
        if (Array.isArray(this.data))
            return this.data[index];
        for (let v of this) {
            if (index-- === 0)
                return v;
        }
    }

    any(
        predicate : Function = check.exists
    ): Boolean {
        if (predicate && typeof predicate === 'function') {
            for (let v of this) {
                if (predicate(v))
                    return true;
            }
        }
        return false;
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
        let iters = [Iterable.expand(this.data)];
        for (let arg of args) {
            if (arg instanceof Iterable) // a bit hacky... but functional. need to make sure we can use iter1.concat(iter1)
                iters.push(Iterable.expand(arg.data));
            else
                iters.push(arg);
        }
        this.data = function*() {
            for (let iter of iters) {
                for (let v of iter)
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
        var seen = [];
        let prev = Iterable.expand(this.data); // does this need to be expanded interally?
        this.data = function*() {
            for (let v of prev) {
                let selected = selector(v);
                /* eslint-disable no-loop-func */
                if (!seen.find(x => util.equals(x, selected))) { // safe?
                    seen.push(selected);
                    yield v;
                }
                /* eslint-enable no-loop-func */
            }
        };
        return this;
    }

    empty(): Boolean {
        for (let v of this) {
            if (!check.empty(v))
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
        return null;
    }

    flatten(): Iterable {
        let expanded = Iterable.expand(this.data);
        this.data = _flatten(expanded);
        return this;
    }

    full(): Boolean {
        for (let v of this) {
            if (check.empty(v))
                return false;
        }
        return true;
    }

    join(...args): MultiIterable {
        return new MultiIterable(this, ...args);
    }

    last(
        predicate : Function
    ): any {
        if (check.is(this.data, Array)) {

            if (check.is(predicate, Function)) {
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
                result = null,
                expanded = Iterable.expand(this.data);
            if (check.is(predicate, Function)) {
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
        return null;
    }

    length(): Number {
        // shortcut if we have array / set / map / etc
        if (this.data.length)
            return this.data.length;
        let len = 0;
        for (let v of this)
            len++;
        return len;
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
        let expanded = Iterable.expand(this.data);
        this.data = function*() {
            yield* reverse(expanded, expanded.next());
        };
        return this;
    }

    select(selector: Function = (x) => x): Iterable {
        let data = this.data; // expand needs to be internal in this case.
        this.data = function*() {
            for (let v of Iterable.expand(data))
                yield selector(v);
        };
        return this;
    }

    skip(count: Number = 1): Iterable {
        let expanded = Iterable.expand(this.data);
        this.data = function*() {
            let a,
                i = 0;
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

    sum = function(
        selector : Function = x => x
    ): Number {
        let sum = 0;
        for (let v of this) {
            let num = selector(v);
            if (check.is(num, Number))
                sum += num;
        }
        return sum;
    }

    take(count: Number = 1): Iterable {
        let expanded = Iterable.expand(this.data);
        this.data = function*() {
            let i = 0;
            for (let v of expanded) {
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
        let data = this.data;
        this.data = function*() {
            for (let v of Iterable.expand(data)) {
                if (predicate(v))
                    yield v;
            }
        };
        return this;
    }

    while(predicate: Function = x => x): Iterable {
        let prev = Iterable.expand(this.data);
        this.data = function*() {
            for (var v of prev) {
                if (!predicate(v))
                    break;
                yield v;
            }
        };
        return this;
    }
}

Iterable.wrap = Iterable.from;
Iterable.prototype.filter = Iterable.prototype.where;
Iterable.prototype.map = Iterable.prototype.select;
Iterable.prototype.takeWhile = Iterable.prototype.while;

export class MultiIterable extends Iterable {

    iterables: Array<Iterable>;

    constructor(...args) {
        super(); // cheating.. sort of..
        this.iterables = [];
        this.join(...args);

        let self = this; // since we cant use arrow functions or bind with generators
        this.data = function*() {
            let expanded = [];
            for (let iter of self.iterables)
                expanded.push(Array.from(Iterable.expand(iter)));
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

    static from(...args) {
        return new MultiIterable(...args);
    }

    get [Symbol.toStringTag]() {
        return 'MultiIterable';
    }

    /*
        need to be able to chain .join calls
        as a result, we need to keep a running list of iterables which have been joined,
        but only access them whenever this.data is used (iteration over Iterable)

        examples:

        new Iterable([1,2,3])
            .join([4,5,6])
            .join([7,8,9]);

        OR new Iterable([1,2,3])
            .join([4,5,6], [7,8,9]);

        OR new MultiIterable([1,2,3], [4,5,6], [7,8,9])

        the desired yields are:
            [1,4,7]
            [1,4,8]
            [1,4,9]
            [1,5,7]
            [1,5,8]
            [1,5,9]
            ...
            [3,6,7]
            [3,6,8]
            [3,6,9]
    */
    join(...args) {
        for (let v of args)
            this.iterables.push(v); // keep a running list of iterables, only use them when this.data is iterated over
        return this;
    }
}

MultiIterable.wrap = MultiIterable.from;

export class OrderedIterable extends Iterable {

    comparer   : Function;
    selector   : Function;
    descending : boolean;

    constructor(
          data       : any
        , selector   : Function
        , comparer   : Function = (x, y) => x > y ? 1 : x < y ? -1 : 0
        , descending : boolean = false
    ) {
        super();
        this.selector = selector;
        this.comparer = (x, y) => {
            let result = comparer(x, y);
            return (descending ? -result : result);
        };
        // this.descending = descending;
        let expanded = Iterable.expand(data);
        let self = this;
        this.data = function*() {
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

export function from(...args) {
    if (args.length === 1)
        return new Iterable(args[0]);
    else if (args.length > 1)
        return new MultiIterable(...args);
    else
        return Iterable.empty();
}
export var wrap = from;
