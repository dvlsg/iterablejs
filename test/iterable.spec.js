"use strict";

import Iterable, { from, wrap, OrderedIterable, MultiIterable } from '../src/iterable.js';
import assert from 'zana-assert';

describe('Iterable', () => {

    describe('constructor()', () => {

        it('should return an empty iterable by default', () => {
            let iter = new Iterable();
            assert.equal(iter.toArray(), []);
        });

        it('should construct from an array', () => {
            let iter = new Iterable([1, 2, 3]);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should construct from a generator function', () => {
            let iter = new Iterable(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should construct from a generator', () => {
            let iter = new Iterable(function*() { yield 1; yield 2; yield 3; }());
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should construct from a set', () => {
            let iter = new Iterable(new Set([1, 2, 3, 1]));
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should construct from a map', () => {
            let iter = new Iterable(new Map([['a', 1], ['b', 2], ['c', 3]]));
            assert.equal(iter.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
        });

        it('should construct from anything with [Symbol.iterator] defined', () => {
            let obj = {
                *[Symbol.iterator]() {
                    yield 1; yield 2; yield 3;
                }
            };
            let iter = new Iterable(obj);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

    });

    describe('[toStringTag]', () => {

        it('should return \'Iterable\'', () => {
            let iter = new Iterable();
            assert.equal(iter[Symbol.toStringTag], 'Iterable');
            assert.equal(Object.prototype.toString.call(new Iterable()), '[object Iterable]');
            assert.equal(Object.prototype.toString.call(Iterable.prototype), '[object Iterable]');
        });

    });

    describe('Iterable.from()', () => {

        it('should construct an empty iterable with no arguments', () => {
            let iter = Iterable.from();
            assert.is(iter, Iterable);
            assert.equal(iter.toArray(), []);
        });

        it('should construct an iterable with one argument', () => {
            let iter = Iterable.from([1, 2, 3]);
            assert.is(iter, Iterable);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should construct a multi iterable with multiple arguments', () => {
            let iter = Iterable.from([1, 2], [3, 4]);
            assert.is(iter, MultiIterable);
            assert.equal(iter.toArray(), [[1, 3], [1, 4], [2, 3], [2, 4]]);
        });

        it('should be exposed an alias for the exported from()', () => {
            assert.equal(from, Iterable.from);
        });

    });

    describe('Iterable.empty()', () => {

        it('should construct an empty iterable', () => {
            let iter = Iterable.empty();
            assert.is(iter, Iterable);
            assert.equal(iter.toArray(), []);
        });

    });

    describe('Iterable.wrap()', () => {

        it('should be an alias for Iterable.from()', () => {
            assert.equal(Iterable.wrap, Iterable.from);
            assert.equal(wrap, from);
            assert.equal(Iterable.wrap, wrap);
        });

    });

    describe('aggregate()', () => {

        it('should reduce an iterable to a single value', () => {
            let iter = from([1, 2, 3, 4, 5]);
            let val = iter.aggregate((carry, current) => {
                return carry + current;
            });
            assert.equal(val, 15);
        });

        it('should use a seed', () => {
            let iter = from([2, 3, 4, 5]);
            let val = iter.aggregate((carry, current) => {
                return carry + current;
            }, 1);
            assert.equal(val, 15);
        });

    });

    describe('any()', () => {

        it('should return true when the iterable contains values != null', () => {
            let iter = from([null, null, 1, undefined, null]);
            assert.true(iter.any());
        });

        it('should return false when the iterable does not contain values != null', () => {
            let iter = from([null, null, undefined, undefined, null]);
            assert.false(iter.any());

            let iter2 = new Iterable();
            assert.false(iter2.any());
        });

        it('should use a custom predicate', () => {
            let iter = from([null, null, undefined, null]);
            assert.true(iter.any(x => x === undefined));
        });

    });

    describe('at()', () => {

        it('should return a value at a given zero-based index', () => {
            let iter = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter.at(2), 3);
        });

        it('should return undefined with index out of bounds', () => {
            let iter = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter.at(3), undefined);

            let iter2 = new Iterable();
            assert.equal(iter2.at(0), undefined);
        });

        it('should return undefined with no index', () => {
            let iter = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter.at(), undefined);
        });

    });

    describe('average()', () => {

        it('should return the average of iterated numbers', () => {
            let iter = from([1, 2, 3, 4]);
            assert.equal(iter.average(), ((1 + 2 + 3 + 4) / 4));
        });

        it('should consider all non-numbers to be 0', () => {
            let iter = from([1, 2, undefined, '3', 4]);
            assert.equal(iter.average(), ((1 + 2 + 0 + 0 + 4) / 5));
        });

        it('should return 0 from an empty iterable', () => {
            let iter = new Iterable();
            assert.equal(iter.average(), 0);
        });

        it('should use a custom selector', () => {
            let iter = from([1, 2, 3, 4]);
            assert.equal(iter.average(x => x * 2), ((1 * 2 + 2 * 2 + 3 * 2 + 4 * 2) / 4));
        });

    });

    describe('concat()', () => {

        it('should yield concatenated iterables', () => {
            let iter = from([1, 2, 3]);
            iter.concat([4, 5, 6]);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5, 6]);
        });

        it('should be able to concatenate an iterable with itself', () => {
            let iter = from([1, 2, 3]);
            iter.concat(iter);
            assert.equal(iter.toArray(), [1, 2, 3, 1, 2, 3]);
        });

        it('should be able to concatenate multiple iterables', () => {
            let iter1 = from([1, 2]);
            let iter2 = from([3, 4]);
            let iter3 = from([5, 6]);
            assert.equal(iter1.concat(iter2, iter3).toArray(), [1, 2, 3, 4, 5, 6]);
        });

    });

    describe('contains()', () => {

        it('should return true if iterable contains the provided item', () => {
            let iter = from([1, 2, 3, 4, 5]);
            assert.true(iter.contains(3));
        });

        it('should return false if iterable does not contain the provided item', () => {
            let iter = from([1, 2, 3, 4, 5]);
            assert.false(iter.contains(7));
        });

        it('should use a deep equality comparison by default', () => {
            let iter = from([
                {a: 1},
                {b: 2},
                {c: 3},
                {d: [1, 2, 3]}
            ]);
            assert.true(iter.contains({d: [1, 2, 3]}));
        });

    });

    describe('distinct()', () => {

        it('should yield only distinct elements', () => {
            let iter = from([1, 2, 3, 1]);
            assert.equal(iter.distinct().toArray(), [1, 2, 3]);
        });

        it('should yield only distinct elements by custom hashing function', () => {
            let iter = from([
                {a: 1, b: 2, c: 2},
                {a: 2, b: 1, c: 3},
                {a: 3, b: 2, c: 2},
                {a: 4, b: 2, c: 3},
                {a: 5, b: 2, c: 2}
            ]);
            iter.distinct(x => `${x.b}${x.c}`);
            assert.equal(iter.toArray(), [
                {a: 1, b: 2, c: 2},
                {a: 2, b: 1, c: 3},
                {a: 4, b: 2, c: 3}
            ]);
        });

    });

    describe('empty()', () => {

        it('should return true if all iterated values are null or undefined', () => {
            let undef;
            let iter = from([undefined, null, null, undefined, undef]);
            assert.true(iter.empty());
        });

        it('should return false if any iterated value is not null or undefined', () => {
            let undef;
            let iter = from([undefined, null, 1, undefined, undef]);
            assert.false(iter.empty());
        });

    });

    describe('filter()', () => {

        it('should be an alias for where()', () => {
            let iter = from([1, 2, 3]);
            assert.equal(iter.filter, iter.where);
        });

    });

    describe('first()', () => {

        it('should return the first element of an iterable', () => {
            let iter = from([1, 2, 3]);
            assert.equal(iter.first(), 1);
        });

        it('should return the first element matching a given predicate', () => {
            let iter = from([1, 2, 3]);
            assert.equal(iter.first(x => x > 2), 3);
        });

        it('should return undefined from an empty iterable', () => {
            let iter = from([]);
            assert.equal(iter.first(), undefined);
        });

    });

    describe('flatten()', () => {

        it('should yield all non-iterable elements from a multi-tiered iterable', () => {
            let iter = from([1, 2, 3, [4, 5, 6], 7, 8, [9, [10]]]);
            assert.equal(iter.flatten().toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

            let iter2 = from([1, 2, 3, [function*() { yield 4; yield [5, 6]; }]]);
            assert.equal(iter2.flatten().toArray(), [1, 2, 3, 4, 5, 6]);
        });

    });

    describe('full()', () => {

        it('should return true if all iterated values are null or undefined', () => {
            let undef;
            let iter = from([undefined, null, null, undefined, undef]);
            assert.true(iter.empty());
        });

        it('should return false if any iterated value is not null or undefined', () => {
            let undef;
            let iter = from([undefined, null, 1, undefined, undef]);
            assert.false(iter.empty());
        });

    });

    describe('intersect()', () => {

        it('should yield only the intersection of both iterables', () => {
            let iter = from([1, 2, 3, 4, 5]);
            assert.equal(iter.intersect([1, 3, 5, 7, 9]).toArray(), [1, 3, 5]);
        });

        it('should yield only distinct elements from the intersection', () => {
            let iter = from([1, 2, 3, 4, 5]);
            assert.equal(iter.intersect([1, 1, 3, 3, 3, 5, 7, 9, 3]).toArray(), [1, 3, 5]);
        });

        it('should use a custom hashing function to determine intersection', () => {
            let iter1 = from([
                {a: 1, b: 2, c: 5},
                {a: 2, b: 2, c: 4},
                {a: 3, b: 2, c: 3},
                {a: 4, b: 2, c: 2},
                {a: 5, b: 2, c: 1}
            ]);
            let iter2 = from([
                {a: 9, b: 2, c: 1},
                {a: 7, b: 2, c: 2},
                {a: 5, b: 2, c: 3},
                {a: 3, b: 2, c: 4},
                {a: 1, b: 2, c: 5},
                {a: 1, b: 2, c: 5},
                {a: 1, b: 2, c: 5},
                {a: 1, b: 2, c: 5},
                {a: 1, b: 2, c: 5},
                {a: 1, b: 2, c: 5}
            ]);
            assert.equal(
                iter1.intersect(iter2, x => `${x.a}${x.c}`).toArray(),
                [{a: 1, b: 2, c: 5}]
            );
        });

    });

    describe('join()', () => {

        it('should return a MultiIterable', () => {
            let iter = from([1, 2]).join([3, 4]);
            assert.is(iter, MultiIterable);
            assert.instance(iter, MultiIterable);
        });

        it('should yield a cartesian product of all iterables', () => {
            let iter = from([1, 2]).join([3, 4]);
            assert.equal(iter.toArray(), [[1, 3], [1, 4], [2, 3], [2, 4]]);
        });

        it('should accept more than one argument', () => {
            let iter = from([1, 2]).join([3, 4], [5, 6]);
            assert.equal(iter.toArray(), [
                [1, 3, 5],
                [1, 3, 6],
                [1, 4, 5],
                [1, 4, 6],
                [2, 3, 5],
                [2, 3, 6],
                [2, 4, 5],
                [2, 4, 6]
            ]);

        });

    });

    describe('last()', () => {

        it('should return the last element of an iterable', () => {
            let iter = from([1, 2, 3]);
            assert.equal(iter.last(), 3);
        });

        it('should return the last element matching a given predicate', () => {
            let iter = from([1, 2, 3]);
            assert.equal(iter.last(x => x < 3), 2);
        });

        it('should return undefined from an empty iterable', () => {
            let iter = from([]);
            assert.equal(iter.last(), undefined);
        });

    });

    describe('length()', () => {

        it('should return the length of an iterable', () => {
            let iter1 = from([]);
            assert.equal(iter1.length(), 0);

            let iter2 = from([1, 2, 3]);
            assert.equal(iter2.length(), 3);

            let iter3 = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter3.length(), 3);
        });

        it('should use pre-defined length property if numeric', () => {
            let property = false;
            let iterated = false;
            class A {
                *[Symbol.iterator]() {
                    iterated = true;
                    yield 1;
                    yield 2;
                    yield 3;
                }
                get length() {
                    property = true;
                    return 5;
                }
            }
            let iter = from(new A());
            assert.equal(iter.length(), 5);
            assert.false(iterated);
            assert.true(property);
        });

    });

    describe('map()', () => {

        it('should be an alias for select()', () => {
            let iter = new Iterable();
            assert.equal(iter.map, iter.select);
        });

    });

    describe('max()', () => {

        it('should return a max of iterated numbers', () => {
            let iter = from([1, 4, 3, 4, 9, 0]);
            assert.equal(iter.max(), 9);
        });

        it('should ignore all non-numbers', () => {
            let iter = from([1, 4, undefined, '3', 4, '9', 0]);
            assert.equal(iter.max(), 4);
        });

        it('should return undefined from an empty iterable', () => {
            let iter = new Iterable();
            assert.equal(iter.max(), undefined);
        });

        it('should return undefined from an iterable not containing numbers', () => {
            let iter = from(['1', '2', '3']);
            assert.equal(iter.max(), undefined);
        });

        it('should use a custom selector', () => {
            let iter = from([
                {a: 1, b: 2, c: 5},
                {a: 2, b: 4, c: 4},
                {a: 3, b: 7, c: 3},
                {a: 4, b: 4, c: 2},
                {a: 5, b: 2, c: 1}
            ]);
            assert.equal(iter.max(x => x.b), 7);
        });

    });

    describe('merge()', () => {

        it('should be an alias for zip()', () => {
            let iter = new Iterable();
            assert.equal(iter.merge, iter.zip);
        });

    });

    describe('min()', () => {

        it('should return a min of iterated numbers', () => {
            let iter = from([8, 4, 2, 4, 9, 7]);
            assert.equal(iter.min(), 2);
        });

        it('should ignore all non-numbers', () => {
            let iter = from([1, 4, undefined, '3', 4, '9', 0]);
            assert.equal(iter.min(), 0);
        });

        it('should return undefined from an empty iterable', () => {
            let iter = new Iterable();
            assert.equal(iter.min(), undefined);
        });

        it('should return undefined from an iterable not containing numbers', () => {
            let iter = from(['1', '2', '3']);
            assert.equal(iter.min(), undefined);
        });

        it('should use a custom selector', () => {
            let iter = from([
                {a: 1, b: 7, c: 5},
                {a: 2, b: 4, c: 4},
                {a: 3, b: 2, c: 3},
                {a: 4, b: 4, c: 2},
                {a: 5, b: 7, c: 1}
            ]);
            assert.equal(iter.min(x => x.b), 2);
        });

    });

    describe('orderBy()', () => {

        it('should return an OrderedIterable', () => {
            let iter = from([1, 2, 3]).orderBy(x => x);
            assert.is(iter, OrderedIterable);
            assert.instance(iter, OrderedIterable);
        });

        it('should determine order using elements from a selector', () => {
            let iter = from([3, 1, 2]).orderBy(x => x);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should determine order by a given comparer', () => {
            let comparer = (x, y) => x > y ? -1 : x < y ? 1 : 0;
            let iter = from([3, 1, 2]).orderBy(x => x, comparer);
            assert.equal(iter.toArray(), [3, 2, 1]);
        });

        it('should set descending by flag', () => {
            let iter = from([3, 1, 2]).orderBy(x => x, undefined, true);
            assert.equal(iter.toArray(), [3, 2, 1]);
        });

        it('should use a stable sort', () => {
            let iter = from([
                { id: 1, num: 22, num2: 99 },
                { id: 2, num: 33, num2: 44 },
                { id: 3, num: 22, num2: 44 },
                { id: 4, num: 33, num2: 99 },
                { id: 5, num: 33, num2: 44 },
                { id: 6, num: 22, num2: 99 },
                { id: 7, num: 33, num2: 99 },
                { id: 8, num: 33, num2: 99 },
                { id: 9, num: 22, num2: 44 }
            ]).orderBy(x => x.num);
            assert.equal(iter.toArray(), [
                { id: 1, num: 22, num2: 99 },
                { id: 3, num: 22, num2: 44 },
                { id: 6, num: 22, num2: 99 },
                { id: 9, num: 22, num2: 44 },
                { id: 2, num: 33, num2: 44 },
                { id: 4, num: 33, num2: 99 },
                { id: 5, num: 33, num2: 44 },
                { id: 7, num: 33, num2: 99 },
                { id: 8, num: 33, num2: 99 }
            ]);
        });

    });

    describe('orderByDescending()', () => {

        it('should be a method for orderBy(selector, comparer, descending=true)', () => {
            let arr = [3, 1, 2, 8, 6, 3, 1, 6, 8, 2];
            let iter1 = from(arr).orderBy(x => x, undefined, true);
            let iter2 = from(arr).orderByDescending(x => x);
            assert.equal(iter1.toArray(), iter2.toArray());
        });

    });

    describe('reduce()', () => {

        it('should be an alias for aggregate()', () => {
            let iter = new Iterable();
            assert.equal(iter.reduce, iter.aggregate);
        });

    });

    describe('reverse()', () => {

        it('should yield iterable elements in reverse', () => {
            let iter1 = from([1, 2, 3, 4, 5]);
            assert.equal(iter1.reverse().toArray(), [5, 4, 3, 2, 1]);

            let iter2 = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter2.reverse().toArray(), [3, 2, 1]);
        });

    });

    describe('select()', () => {

        it('should yield selected / mapped elements', () => {
            let iter1 = from([1, 2, 3]);
            assert.equal(iter1.select(x => x * 2).toArray(), [2, 4, 6]);

            let iter2 = from([
                {a: 1, b: 2, c: 5},
                {a: 2, b: 4, c: 4},
                {a: 3, b: 7, c: 3},
                {a: 4, b: 4, c: 2},
                {a: 5, b: 2, c: 1}
            ]).select(x => ({
                a: x.a,
                b: x.b,
                c: x.c,
                sum: x.a + x.b + x.c
            }));
            assert.equal(iter2.toArray(), [
                {a: 1, b: 2, c: 5, sum: 8},
                {a: 2, b: 4, c: 4, sum: 10},
                {a: 3, b: 7, c: 3, sum: 13},
                {a: 4, b: 4, c: 2, sum: 10},
                {a: 5, b: 2, c: 1, sum: 8}
            ]);
        });

    });

    describe('skip()', () => {

        it('should yield elements after provided skip count', () => {
            let iter = from([1, 2, 3, 4, 5, 6, 7, 8, 9]).skip(4);
            assert.equal(iter.toArray(), [5, 6, 7, 8, 9]);
        });

        it('should yield no elements if count is greater than length', () => {
            let iter = from([1, 2, 3]).skip(4);
            assert.equal(iter.toArray(), []);
        });

        it('should yield all elements if count is not positive', () => {
            let iter1 = from([1, 2, 3]).skip(0);
            assert.equal(iter1.toArray(), [1, 2, 3]);

            let iter2 = from([1, 2, 3]).skip(-20);
            assert.equal(iter2.toArray(), [1, 2, 3]);
        });

    });

    describe('sum()', () => {

        it('should return the sum of iterated numbers', () => {
            let iter = from([1, 2, 3, 4]);
            assert.equal(iter.sum(), (1 + 2 + 3 + 4));
        });

        it('should consider all non-numbers to be 0', () => {
            let iter = from([1, 2, undefined, '3', 4]);
            assert.equal(iter.sum(), (1 + 2 + 0 + 0 + 4));
        });

        it('should return 0 from an empty iterable', () => {
            let iter = new Iterable();
            assert.equal(iter.sum(), 0);
        });

        it('should use a custom selector', () => {
            let iter = from([1, 2, 3, 4]);
            assert.equal(iter.sum(x => x * 2), (1 * 2 + 2 * 2 + 3 * 2 + 4 * 2));
        });

    });

    describe('take()', () => {

        it('should yield elements until the given take count', () => {
            let iter = from([1, 2, 3, 4, 5, 6, 7, 8, 9]).take(4);
            assert.equal(iter.toArray(), [1, 2, 3, 4]);
        });

        it('should take all elements if count is greater than length', () => {
            let iter = from([1, 2, 3]).take(4);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should yield no elements if count is non positive', () => {
            let iter1 = from([1, 2, 3]).take(0);
            assert.equal(iter1.toArray(), []);

            let iter2 = from([1, 2, 3]).take(-20);
            assert.equal(iter2.toArray(), []);
        });

    });

    describe('takeWhile()', () => {

        it('should be an alias for while()', () => {
            let iter = new Iterable();
            assert.equal(iter.takeWhile, iter.while);
        });

    });

    describe('toArray()', () => {

        it('should convert an iterable to an array', () => {
            let iter1 = from([1, 2, 3]);
            assert.equal(iter1.toArray(), [1, 2, 3]);

            let iter2 = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter2.toArray(), [1, 2, 3]);
        });

    });

    describe('union()', () => {

        it('should be an alias for concat()', () => {
            let iter = new Iterable();
            assert.equal(iter.union, iter.concat);
        });
    });

    describe('where()', () => {

        it('should yield only elements passing a predicate', () => {
            let iter = from([1, 2, 3, 4, 5]).where(x => x % 2 === 0);
            assert.equal(iter.toArray(), [2, 4]);
        });

    });

    describe('while()', () => {

        it('should yield elements until a predicate fails', () => {
            let iter = from([1, 2, 3, 4, 5, -1, 6, 7, 8]).while(x => x > 0);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
        });

    });

    describe('zip()', () => {

        it('should zip two iterables together by selector', () => {
            let iter = from([1, 2, 3, 4, 5]).zip([1, 3, 5, 7, 9], (x, y) => x + y);
            assert.equal(iter.toArray(), [2, 5, 8, 11, 14]);
        });

        it('should only yield zipped elements until one iterable is finished', () => {
            let iter1 = from([1, 2, 3]).zip([1, 2, 3, 4, 5, 6, 7], (x, y) => x + y);
            assert.equal(iter1.toArray(), [2, 4, 6]);

            let iter2 = from([1, 2, 3, 4, 5, 6, 7]).zip([1, 2, 3], (x, y) => x + y);
            assert.equal(iter2.toArray(), [2, 4, 6]);
        });

        it('should extend elements when selector is not provided', () => {
            let arr1 = [
                { a: 1, b: 2, c: [ 3, 4, 5 ] },
                { a: 2, b: 3, c: [ 3, 4, 5 ] },
                { a: 3, b: 3, c: [ 3, 4, 5 ] },
                { a: 4, b: 2, c: [ 3, 4, 5 ] },
                { a: 5, b: 3, c: [ 3, 4, 5 ] }
            ];
            let arr2 = [
                { a: 5, b: 3, c: [ 6, 7, 8, 9 ], d: 9 },
                { a: 4, b: 2, c: [ 6, 7, 8, 9 ], d: 5 },
                { a: 3, b: 2, c: [ 6, 7, 8, 9 ], d: 5 },
                { a: 2, b: 3, c: [ 6, 7, 8, 9 ], d: 9 },
                { a: 1, b: 2, c: [ 6, 7, 8, 9 ], d: 5 }
            ];
            let iter = from(arr1).zip(arr2);
            assert.equal(iter.toArray(), [
                { a: 1, b: 2, c: [ 3, 4, 5, 9 ], d: 9 },
                { a: 2, b: 3, c: [ 3, 4, 5, 9 ], d: 5 },
                { a: 3, b: 3, c: [ 3, 4, 5, 9 ], d: 5 },
                { a: 4, b: 2, c: [ 3, 4, 5, 9 ], d: 9 },
                { a: 5, b: 3, c: [ 3, 4, 5, 9 ], d: 5 }
            ]);
        });

    });

    describe('chainability', () => {

        it('should allow function chaining', () => {
            let arr1 = [
                { a: 1, b: 2, c: [ 8, 1, 5 ] },
                { a: 2, b: 3, c: [ 0, 2, 5 ] },
                { a: 3, b: 3, c: [ 1, 4, 5 ] },
                { a: 4, b: 2, c: [ 6, 2, 5 ] },
                { a: 5, b: 3, c: [ 3, 4, 5 ] }
            ];
            let arr2 = [
                { a: 5, b: 3, c: [ 5, 1, 9, 9 ], d: 5 },
                { a: 4, b: 2, c: [ 4, 2, 8, 8 ], d: 5 },
                { a: 3, b: 2, c: [ 3, 3, 9, 9 ], d: 5 },
                { a: 2, b: 3, c: [ 2, 4, 8, 9 ], d: 9 },
                { a: 1, b: 2, c: [ 1, 5, 9, 9 ], d: 5 }
            ];

            let iter = from(arr1)
                .where(x => x.b === 3)
                .join(arr2)
                .where(([x, y]) => x.b === y.b)
                .select(([x, y]) => ({
                    a: x.a,
                    b: x.b,
                    c: x.c.concat(y.c),
                    d: y.d
                }))
                .distinct(x => from(x.c).sum())
                .select(x => {
                    x.c = from(x.c).sum();
                    return x;
                })
                .orderByDescending(x => x.d)
                .thenBy(x => x.c);
            assert.equal(iter.toArray(), [
                { a: 2, b: 3, c: 30, d: 9 },
                { a: 3, b: 3, c: 33, d: 9 },
                { a: 5, b: 3, c: 35, d: 9 },
                { a: 2, b: 3, c: 31, d: 5 },
                { a: 3, b: 3, c: 34, d: 5 },
                { a: 5, b: 3, c: 36, d: 5 }
            ]);
        });

    });

    describe('lazy loading', () => {

        it('should not execute until iteration', () => {
            let count = 0;
            let arr1 = [
                { a: 1, b: 2, c: [ 8, 1, 5 ] },
                { a: 2, b: 3, c: [ 0, 2, 5 ] },
                { a: 3, b: 3, c: [ 1, 4, 5 ] },
                { a: 4, b: 2, c: [ 6, 2, 5 ] },
                { a: 5, b: 3, c: [ 3, 4, 5 ] }
            ];
            let iter = from(arr1)
                .concat(arr1)
                .concat(arr1)
                .select(x => {
                    count++;
                    x.d = x.a + x.b;
                    return x;
                });
            let i = 0;
            let it = iter[Symbol.iterator]();
            while (!it.next().done)
                assert.equal(++i, count);
            i *= 2;
            iter.toArray();
            assert.equal(i, count);
        });

    });

    describe('reusability', () => {

        it('should be re-iterable with arrays', () => {
            let iter = from([1, 2, 3, 4, 5]);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
        });

        it('should be re-iterable with sets', () => {
            let iter = from(new Set([1, 2, 3, 4, 5]));
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iter.toArray(), [1, 2, 3, 4, 5]);
        });

        it('should be re-iterable with maps', () => {
            let iter = from(new Map([['a', 1], ['b', 2], ['c', 3]]));
            assert.equal(iter.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
            assert.equal(iter.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
            assert.equal(iter.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
        });

        it('should be re-iterable with generator functions', () => {
            let iter = from(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter.toArray(), [1, 2, 3]);
            assert.equal(iter.toArray(), [1, 2, 3]);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should not be re-iterable with executed generator functions', () => {
            let iter = from(function*() { yield 1; yield 2; yield 3; }());
            assert.equal(iter.toArray(), [1, 2, 3]);
            assert.equal(iter.toArray(), []);
            assert.equal(iter.toArray(), []);
        });

    });

});

describe('MultiIterable', () => {

    describe('constructor()', () => {

        it('should accept multiple iterable items', () => {
            let iter = new MultiIterable([1, 2], function*() { yield 3; yield 4; }, new Set([5, 6]));
            assert.equal(iter.toArray(), [
                [1, 3, 5],
                [1, 3, 6],
                [1, 4, 5],
                [1, 4, 6],
                [2, 3, 5],
                [2, 3, 6],
                [2, 4, 5],
                [2, 4, 6]
            ]);
        });

    });

    describe('[toStringTag]', () => {

        it('should return \'MultiIterable\'', () => {
            let iter = new MultiIterable();
            assert.equal(iter[Symbol.toStringTag], 'MultiIterable');
            assert.equal(Object.prototype.toString.call(iter), '[object MultiIterable]');
            assert.equal(Object.prototype.toString.call(MultiIterable.prototype), '[object MultiIterable]');
        });

    });

    describe('join()', () => {

        it('should dynamically join iterables', () => {
            let iter = new MultiIterable([1, 2], [3, 4]);
            assert.equal(iter.toArray(), [[1, 3], [1, 4], [2, 3], [2, 4]]);
            iter.join([5, 6]);
            assert.equal(iter.toArray(), [
                [1, 3, 5],
                [1, 3, 6],
                [1, 4, 5],
                [1, 4, 6],
                [2, 3, 5],
                [2, 3, 6],
                [2, 4, 5],
                [2, 4, 6]
            ]);
        });

    });

});

describe('OrderedIterable', () => {

    describe('constructor()', () => {

        it('should accept an iterable', () => {
            let iter = new OrderedIterable([3, 1, 2]);
            assert.equal(iter.toArray(), [1, 2, 3]);
        });

        it('should accept a custom selector', () => {
            let iter = new OrderedIterable([3, 1, 2], x => -x);
            assert.equal(iter.toArray(), [3, 2, 1]);
        });

        it('should accept a custom comparer', () => {
            let comparer = (x, y) => x > y ? -1 : x < y ? 1 : 0;
            let iter = new OrderedIterable([3, 1, 2], undefined, comparer);
            assert.equal(iter.toArray(), [3, 2, 1]);
        });

        it('should set descending by flag', () => {
            let iter = new OrderedIterable([3, 1, 2], undefined, undefined, true);
            assert.equal(iter.toArray(), [3, 2, 1]);
        });

    });

    describe('[toStringTag]', () => {

        it('should return \'OrderedIterable\'', () => {
            let iter = new OrderedIterable();
            assert.equal(iter[Symbol.toStringTag], 'OrderedIterable');
            assert.equal(Object.prototype.toString.call(iter), '[object OrderedIterable]');
            assert.equal(Object.prototype.toString.call(OrderedIterable.prototype), '[object OrderedIterable]');
        });

    });

    describe('thenBy()', () => {

        it('should add another order without altering previous orders', () => {
            let arr1 = [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ];

            let iter = new OrderedIterable(arr1, x => x.num).thenBy(x => x.num2);
            assert.equal(iter.toArray(), [
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ]);

            iter = iter.thenBy(x => x.num3);
            assert.equal(iter.toArray(), [
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 5, num: 22, num2: 44, num3: 55 },
                { id: 2, num: 22, num2: 44, num3: 66 }
            ]);
        });

        it('should accept a custom comparer', () => {
            let arr1 = [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ];
            let iter = from(arr1)
                .orderBy(x => x.num)
                .thenBy(x => x.num2, (x, y) => x > y ? -1 : x < y ? 1 : 0);
            assert.equal(iter.toArray(), [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 5, num: 22, num2: 44, num3: 55 },
                { id: 3, num: 22, num2: 33, num3: 77 }
            ]);

        });

        it('should set descending by flag', () => {
            let arr1 = [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ];
            let iter = from(arr1)
                .orderBy(x => x.num)
                .thenBy(x => x.num2, undefined, true);
            assert.equal(iter.toArray(), [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 5, num: 22, num2: 44, num3: 55 },
                { id: 3, num: 22, num2: 33, num3: 77 }
            ]);
        });

    });

    describe('thenByDescending()', () => {

        it('should be a method for thenBy(selector, comparer, descending=true)', () => {
            let arr = [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ];
            let iter1 = from(arr).orderBy(x => x.num).thenBy(x => x.num2, undefined, true);
            let iter2 = from(arr).orderBy(x => x.num).thenByDescending(x => x.num2);
            assert.equal(iter1.toArray(), iter2.toArray());
        });

    });

});
