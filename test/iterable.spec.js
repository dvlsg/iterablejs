"use strict";

import Iterable, {
    iter,
    GroupedIterable,
    MultiIterable,
    OrderedIterable
} from '../src/iterable.js';
import assert from 'zana-assert';

describe('Iterable', () => {

    describe('constructor()', () => {

        it('should return an empty iterable by default', () => {
            let iterable = new Iterable();
            assert.equal(iterable.toArray(), []);
        });

        it('should construct from an array', () => {
            let iterable = new Iterable([1, 2, 3]);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should construct from a generator function', () => {
            let iterable = new Iterable(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should construct from a generator', () => {
            let iterable = new Iterable(function*() { yield 1; yield 2; yield 3; }());
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should construct from a set', () => {
            let iterable = new Iterable(new Set([1, 2, 3, 1]));
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should construct from a map', () => {
            let iterable = new Iterable(new Map([['a', 1], ['b', 2], ['c', 3]]));
            assert.equal(iterable.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
        });

        it('should construct from anything with [Symbol.iterator] defined', () => {
            let obj = {
                *[Symbol.iterator]() {
                    yield 1; yield 2; yield 3;
                }
            };
            let iterable = new Iterable(obj);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

    });

    describe('[toStringTag]', () => {

        it('should return \'Iterable\'', () => {
            let iterable = new Iterable();
            assert.equal(iterable[Symbol.toStringTag], 'Iterable');
            assert.equal(Object.prototype.toString.call(new Iterable()), '[object Iterable]');
            assert.equal(Object.prototype.toString.call(Iterable.prototype), '[object Iterable]');
        });

    });

    describe('.iter()', () => {

        it('should construct an empty iterable with no arguments', () => {
            let iterable = Iterable.iter();
            assert.is(iterable, Iterable);
            assert.equal(iterable.toArray(), []);
        });

        it('should construct an iterable with one argument', () => {
            let iterable = Iterable.iter([1, 2, 3]);
            assert.is(iterable, Iterable);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should construct a multi iterable with multiple arguments', () => {
            let iterable = Iterable.iter([1, 2], [3, 4]);
            assert.is(iterable, MultiIterable);
            assert.equal(iterable.toArray(), [[1, 3], [1, 4], [2, 3], [2, 4]]);
        });

        it('should be exposed as an alias for the exported iter()', () => {
            assert.equal(iter, Iterable.iter);
        });

    });

    describe('.empty()', () => {

        it('should construct an empty iterable', () => {
            let iterable = Iterable.empty();
            assert.is(iterable, Iterable);
            assert.equal(iterable.toArray(), []);
        });

    });

    describe('#aggregate()', () => {

        it('should reduce an iterable to a single value', () => {
            let iterable = iter([1, 2, 3, 4, 5]);
            let val = iterable.aggregate((carry, current) => {
                return carry + current;
            });
            assert.equal(val, 15);
        });

        it('should use a seed', () => {
            let iterable = iter([2, 3, 4, 5]);
            let val = iterable.aggregate((carry, current) => {
                return carry + current;
            }, 1);
            assert.equal(val, 15);
        });

    });

    describe('#any()', () => {

        it('should return true when the iterable contains values != null', () => {
            let iterable = iter([null, null, 1, undefined, null]);
            assert.true(iterable.any());
        });

        it('should return false when the iterable does not contain values != null', () => {
            let iterable = iter([null, null, undefined, undefined, null]);
            assert.false(iterable.any());

            let iter2 = new Iterable();
            assert.false(iter2.any());
        });

        it('should use a custom predicate', () => {
            let iterable = iter([null, null, undefined, null]);
            assert.true(iterable.any(x => x === undefined));
        });

    });

    describe('#at()', () => {

        it('should return a value at a given zero-based index', () => {
            let iterable = iter(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iterable.at(2), 3);
        });

        it('should return undefined with index out of bounds', () => {
            let iterable = iter(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iterable.at(3), undefined);

            let iter2 = new Iterable();
            assert.equal(iter2.at(0), undefined);
        });

        it('should return undefined with no index', () => {
            let iterable = iter(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iterable.at(), undefined);
        });

    });

    describe('#average()', () => {

        it('should return the average of iterated numbers', () => {
            let iterable = iter([1, 2, 3, 4]);
            assert.equal(iterable.average(), ((1 + 2 + 3 + 4) / 4));
        });

        it('should consider all non-numbers to be 0', () => {
            let iterable = iter([1, 2, undefined, '3', 4]);
            assert.equal(iterable.average(), ((1 + 2 + 0 + 0 + 4) / 5));
        });

        it('should return 0 from an empty iterable', () => {
            let iterable = new Iterable();
            assert.equal(iterable.average(), 0);
        });

        it('should use a custom selector', () => {
            let iterable = iter([1, 2, 3, 4]);
            assert.equal(iterable.average(x => x * 2), ((1 * 2 + 2 * 2 + 3 * 2 + 4 * 2) / 4));
        });

    });

    describe('#concat()', () => {

        it('should yield concatenated iterables', () => {
            let iterable = iter([1, 2, 3]).concat([4, 5, 6]);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5, 6]);
        });

        it('should be able to concatenate an iterable with itself', () => {
            let iterable = iter([1, 2, 3]);
            iterable = iterable.concat(iterable);
            assert.equal(iterable.toArray(), [1, 2, 3, 1, 2, 3]);
        });

        it('should be able to concatenate multiple iterables', () => {
            let iter1 = iter([1, 2]);
            let iter2 = iter([3, 4]);
            let iter3 = iter([5, 6]);
            assert.equal(iter1.concat(iter2, iter3).toArray(), [1, 2, 3, 4, 5, 6]);
        });

    });

    describe('#contains()', () => {

        it('should return true if iterable contains the provided item', () => {
            let iterable = iter([1, 2, 3, 4, 5]);
            assert.true(iterable.contains(3));
        });

        it('should return false if iterable does not contain the provided item', () => {
            let iterable = iter([1, 2, 3, 4, 5]);
            assert.false(iterable.contains(7));
        });

        it('should use a deep equality comparison by default', () => {
            let iterable = iter([
                {a: 1},
                {b: 2},
                {c: 3},
                {d: [1, 2, 3]}
            ]);
            assert.true(iterable.contains({d: [1, 2, 3]}));
        });

    });

    describe('#distinct()', () => {

        it('should yield only distinct elements', () => {
            let iterable = iter([1, 2, 3, 1]);
            assert.equal(iterable.distinct().toArray(), [1, 2, 3]);
        });

        it('should yield only distinct elements by custom hashing function', () => {
            let iterable = iter([
                {a: 1, b: 2, c: 2},
                {a: 2, b: 1, c: 3},
                {a: 3, b: 2, c: 2},
                {a: 4, b: 2, c: 3},
                {a: 5, b: 2, c: 2}
            ]).distinct(x => `bob${x.b}${x.c}`);
            assert.equal(iterable.toArray(), [
                {a: 1, b: 2, c: 2},
                {a: 2, b: 1, c: 3},
                {a: 4, b: 2, c: 3}
            ]);
        });

    });

    describe('#empty()', () => {

        it('should return true if all iterated values are null or undefined', () => {
            let undef;
            let iterable = iter([undefined, null, null, undefined, undef]);
            assert.true(iterable.empty());
        });

        it('should return false if any iterated value is not null or undefined', () => {
            let undef;
            let iterable = iter([undefined, null, 1, undefined, undef]);
            assert.false(iterable.empty());
        });

    });

    describe('#filter()', () => {

        it('should be an alias for where()', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.filter, iterable.where);
        });

    });

    describe('#first()', () => {

        it('should return the first element of an iterable', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.first(), 1);
        });

        it('should return the first element matching a given predicate', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.first(x => x > 2), 3);
        });

        it('should return undefined from an empty iterable', () => {
            let iterable = iter([]);
            assert.equal(iterable.first(), undefined);
        });

    });

    describe('#firstOrDefault()', () => {

        it('should return the first element of an iterable', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.firstOrDefault(), 1);
        });

        it('should return a provided default from an empty iterable', () => {
            let iterable = iter([]);
            assert.equal(iterable.firstOrDefault(1), 1);
        });

        it('should return a provided default from an iterable with null/undefined', () => {
            let iterable = iter([undefined, null, undefined]);
            assert.equal(iterable.firstOrDefault(1), 1);
        });

        it('should return the first element matching a given predicate', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.firstOrDefault(x => x > 2, 4), 3);
        });

        it('should return the default when no items match a given predicate', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.firstOrDefault(x => x > 5, 4), 4);
        });

    });

    describe('#flatten()', () => {

        it('should yield all non-iterable elements from a multi-tiered iterable', () => {
            let iterable = iter([1, 2, 3, [4, 5, 6], 7, 8, [9, [10]]]);
            assert.equal(iterable.flatten().toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

            let iter2 = iter([1, 2, 3, [function*() { yield 4; yield [5, 6]; }]]);
            assert.equal(iter2.flatten().toArray(), [1, 2, 3, 4, 5, 6]);
        });

    });

    describe('#full()', () => {

        it('should return true if all iterated values are null or undefined', () => {
            let undef;
            let iterable = iter([undefined, null, null, undefined, undef]);
            assert.true(iterable.empty());
        });

        it('should return false if any iterated value is not null or undefined', () => {
            let undef;
            let iterable = iter([undefined, null, 1, undefined, undef]);
            assert.false(iterable.empty());
        });

    });

    describe('#group()', () => {

        const invoices = [
            { product: 1, price: 20, qty: 5, customer: 3 },
            { product: 1, price: 20, qty: 2, customer: 1 },
            { product: 1, price: 20, qty: 8, customer: 1 },
            { product: 2, price: 40, qty: 1, customer: 2 },
            { product: 3, price: 60, qty: 3, customer: 3 }
        ];

        it('should yield GroupedIterables', () => {
            let grouped = iter(invoices).group(x => x.product);
            for (let group of grouped) {
                assert.instance(group, Iterable);
                assert.instance(group, GroupedIterable);
                assert.is(group, GroupedIterable);
            }
        });

        it('should group elements by key selector', () => {
            let keySelector = x => x.product;
            let grouped = iter(invoices).group(keySelector);
            for (let group of grouped) {
                let keys = group.select(keySelector).unique();
                assert.equal(keys.length(), 1); // only one unique key per group.
                let key = keys.first();
                let filtered = invoices.filter(x => keySelector(x) === key); // eslint-disable-line no-loop-func
                assert.equal(filtered.length, group.length()); // same number of objects as the source
                for (let current of filtered)
                    assert.true(group.contains(current)); // ensure that each filtered item exists in the group
            }
        });

        it('should handle iterable work on the groups', () => {
            let grouped = iter(invoices)
                .group(invoice => invoice.product)
                .select(group => ({
                    product: group.key,
                    priceSum: group.sum(invoice => invoice.price * invoice.qty),
                    qtySum: group.sum(invoice => invoice.qty),
                    distinctCustomerCount: group.unique(invoice => invoice.customer).length(),
                    recordCount: group.length()
                }))
                .orderBy(processed => processed.product)
                .toArray();
            assert.equal(grouped[0], { product: 1, priceSum: 300, qtySum: 15, distinctCustomerCount: 2, recordCount: 3 });
            assert.equal(grouped[1], { product: 2, priceSum: 40, qtySum: 1, distinctCustomerCount: 1, recordCount: 1 });
            assert.equal(grouped[2], { product: 3, priceSum: 180, qtySum: 3, distinctCustomerCount: 1, recordCount: 1 });
        });
    });

    describe('#groupBy()', () => {

        it('should be an alias for group()', () => {
            let iterable = iter([]);
            assert.equal(iterable.group, iterable.groupBy);
        });

    });

    describe('#intersect()', () => {

        it('should yield only the intersection of both iterables', () => {
            let iterable = iter([1, 2, 3, 4, 5]);
            assert.equal(iterable.intersect([1, 3, 5, 7, 9]).toArray(), [1, 3, 5]);
        });

        it('should yield only distinct elements from the intersection', () => {
            let iterable = iter([1, 2, 3, 4, 5]);
            assert.equal(iterable.intersect([1, 1, 3, 3, 3, 5, 7, 9, 3]).toArray(), [1, 3, 5]);
        });

        it('should use a custom hashing function to determine intersection', () => {
            let iter1 = iter([
                {a: 1, b: 2, c: 5},
                {a: 2, b: 2, c: 4},
                {a: 3, b: 2, c: 3},
                {a: 4, b: 2, c: 2},
                {a: 5, b: 2, c: 1}
            ]);
            let iter2 = iter([
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

    describe('#join()', () => {

        it('should return a MultiIterable', () => {
            let iterable = iter([1, 2]).join([3, 4]);
            assert.is(iterable, MultiIterable);
            assert.instance(iterable, MultiIterable);
        });

        it('should yield a cartesian product of all iterables', () => {
            let iterable = iter([1, 2]).join([3, 4]);
            assert.equal(iterable.toArray(), [[1, 3], [1, 4], [2, 3], [2, 4]]);
        });

        it('should accept more than one argument', () => {
            let iterable = iter([1, 2]).join([3, 4], [5, 6]);
            assert.equal(iterable.toArray(), [
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

    describe('#last()', () => {

        it('should return the last element of an iterable', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.last(), 3);
        });

        it('should return the last element matching a given predicate', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.last(x => x < 3), 2);
        });

        it('should return undefined from an empty iterable', () => {
            let iterable = iter([]);
            assert.equal(iterable.last(), undefined);
        });

    });

    describe('#lastOrDefault()', () => {

        it('should return the last element of an iterable', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.lastOrDefault(), 3);
        });

        it('should return a provided default from empty iterables', () => {
            let iterable = iter([]);
            assert.equal(iterable.lastOrDefault(1), 1);
        });

        it('should return a provided default from an iterable with null/undefined', () => {
            let iterable = iter([null, undefined, null]);
            assert.equal(iterable.lastOrDefault(1), 1);
        });

        it('should return the last element matching a given predicate', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.lastOrDefault(x => x < 3, 4), 2);
        });

        it('should return the default when no items match a given predicate', () => {
            let iterable = iter([1, 2, 3]);
            assert.equal(iterable.lastOrDefault(x => x < 0, 4), 4);
        });

    });

    describe('#length()', () => {

        it('should return the length of an iterable', () => {
            let iter1 = iter([]);
            assert.equal(iter1.length(), 0);

            let iter2 = iter([1, 2, 3]);
            assert.equal(iter2.length(), 3);

            let iter3 = iter(function*() { yield 1; yield 2; yield 3; });
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
            let iterable = iter(new A());
            assert.equal(iterable.length(), 5);
            assert.false(iterated);
            assert.true(property);
        });

    });

    describe('#map()', () => {

        it('should be an alias for select()', () => {
            let iterable = new Iterable();
            assert.equal(iterable.map, iterable.select);
        });

    });

    describe('#max()', () => {

        it('should return a max of iterated numbers', () => {
            let iterable = iter([1, 4, 3, 4, 9, 0]);
            assert.equal(iterable.max(), 9);
        });

        it('should ignore all non-numbers', () => {
            let iterable = iter([1, 4, undefined, '3', 4, '9', 0]);
            assert.equal(iterable.max(), 4);
        });

        it('should return undefined from an empty iterable', () => {
            let iterable = new Iterable();
            assert.equal(iterable.max(), undefined);
        });

        it('should return undefined from an iterable not containing numbers', () => {
            let iterable = iter(['1', '2', '3']);
            assert.equal(iterable.max(), undefined);
        });

        it('should use a custom selector', () => {
            let iterable = iter([
                {a: 1, b: 2, c: 5},
                {a: 2, b: 4, c: 4},
                {a: 3, b: 7, c: 3},
                {a: 4, b: 4, c: 2},
                {a: 5, b: 2, c: 1}
            ]);
            assert.equal(iterable.max(x => x.b), 7);
        });

    });

    describe('#merge()', () => {

        it('should be an alias for zip()', () => {
            let iterable = new Iterable();
            assert.equal(iterable.merge, iterable.zip);
        });

    });

    describe('#min()', () => {

        it('should return a min of iterated numbers', () => {
            let iterable = iter([8, 4, 2, 4, 9, 7]);
            assert.equal(iterable.min(), 2);
        });

        it('should ignore all non-numbers', () => {
            let iterable = iter([1, 4, undefined, '3', 4, '9', 0]);
            assert.equal(iterable.min(), 0);
        });

        it('should return undefined from an empty iterable', () => {
            let iterable = new Iterable();
            assert.equal(iterable.min(), undefined);
        });

        it('should return undefined from an iterable not containing numbers', () => {
            let iterable = iter(['1', '2', '3']);
            assert.equal(iterable.min(), undefined);
        });

        it('should use a custom selector', () => {
            let iterable = iter([
                {a: 1, b: 7, c: 5},
                {a: 2, b: 4, c: 4},
                {a: 3, b: 2, c: 3},
                {a: 4, b: 4, c: 2},
                {a: 5, b: 7, c: 1}
            ]);
            assert.equal(iterable.min(x => x.b), 2);
        });

    });

    describe('#orderBy()', () => {

        it('should return an OrderedIterable', () => {
            let iterable = iter([1, 2, 3]).orderBy(x => x);
            assert.is(iterable, OrderedIterable);
            assert.instance(iterable, OrderedIterable);
        });

        it('should determine order using elements from a selector', () => {
            let iterable = iter([3, 1, 2]).orderBy(x => x);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should determine order by a given comparer', () => {
            let comparer = (x, y) => x > y ? -1 : x < y ? 1 : 0;
            let iterable = iter([3, 1, 2]).orderBy(x => x, comparer);
            assert.equal(iterable.toArray(), [3, 2, 1]);
        });

        it('should set descending by flag', () => {
            let iterable = iter([3, 1, 2]).orderBy(x => x, undefined, true);
            assert.equal(iterable.toArray(), [3, 2, 1]);
        });

        it('should use a stable sort', () => {
            let iterable = iter([
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
            assert.equal(iterable.toArray(), [
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

    describe('#orderByDescending()', () => {

        it('should be a method for orderBy(selector, comparer, descending=true)', () => {
            let arr = [3, 1, 2, 8, 6, 3, 1, 6, 8, 2];
            let iter1 = iter(arr).orderBy(x => x, undefined, true);
            let iter2 = iter(arr).orderByDescending(x => x);
            assert.equal(iter1.toArray(), iter2.toArray());
        });

    });

    describe('#reduce()', () => {

        it('should be an alias for aggregate()', () => {
            let iterable = new Iterable();
            assert.equal(iterable.reduce, iterable.aggregate);
        });

    });

    describe('#reverse()', () => {

        it('should yield iterable elements in reverse', () => {
            let iter1 = iter([1, 2, 3, 4, 5]);
            assert.equal(iter1.reverse().toArray(), [5, 4, 3, 2, 1]);

            let iter2 = iter(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter2.reverse().toArray(), [3, 2, 1]);
        });

    });

    describe('#select()', () => {

        it('should yield selected / mapped elements', () => {
            let iter1 = iter([1, 2, 3]);
            assert.equal(iter1.select(x => x * 2).toArray(), [2, 4, 6]);

            let iter2 = iter([
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

    describe('#skip()', () => {

        it('should yield elements after provided skip count', () => {
            let iterable = iter([1, 2, 3, 4, 5, 6, 7, 8, 9]).skip(4);
            assert.equal(iterable.toArray(), [5, 6, 7, 8, 9]);
        });

        it('should yield no elements if count is greater than length', () => {
            let iterable = iter([1, 2, 3]).skip(4);
            assert.equal(iterable.toArray(), []);
        });

        it('should yield all elements if count is not positive', () => {
            let iter1 = iter([1, 2, 3]).skip(0);
            assert.equal(iter1.toArray(), [1, 2, 3]);

            let iter2 = iter([1, 2, 3]).skip(-20);
            assert.equal(iter2.toArray(), [1, 2, 3]);
        });

    });

    describe('#sum()', () => {

        it('should return the sum of iterated numbers', () => {
            let iterable = iter([1, 2, 3, 4]);
            assert.equal(iterable.sum(), (1 + 2 + 3 + 4));
        });

        it('should consider all non-numbers to be 0', () => {
            let iterable = iter([1, 2, undefined, '3', 4]);
            assert.equal(iterable.sum(), (1 + 2 + 0 + 0 + 4));
        });

        it('should return 0 from an empty iterable', () => {
            let iterable = new Iterable();
            assert.equal(iterable.sum(), 0);
        });

        it('should use a custom selector', () => {
            let iterable = iter([1, 2, 3, 4]);
            assert.equal(iterable.sum(x => x * 2), (1 * 2 + 2 * 2 + 3 * 2 + 4 * 2));
        });

    });

    describe('#take()', () => {

        it('should yield elements until the given take count', () => {
            let iterable = iter([1, 2, 3, 4, 5, 6, 7, 8, 9]).take(4);
            assert.equal(iterable.toArray(), [1, 2, 3, 4]);
        });

        it('should take all elements if count is greater than length', () => {
            let iterable = iter([1, 2, 3]).take(4);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should yield no elements if count is non positive', () => {
            let iter1 = iter([1, 2, 3]).take(0);
            assert.equal(iter1.toArray(), []);

            let iter2 = iter([1, 2, 3]).take(-20);
            assert.equal(iter2.toArray(), []);
        });

    });

    describe('#takeWhile()', () => {

        it('should be an alias for while()', () => {
            let iterable = new Iterable();
            assert.equal(iterable.takeWhile, iterable.while);
        });

    });

    describe('#toArray()', () => {

        it('should convert an iterable to an array', () => {
            let iter1 = iter([1, 2, 3]);
            assert.equal(iter1.toArray(), [1, 2, 3]);

            let iter2 = iter(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iter2.toArray(), [1, 2, 3]);
        });

    });

    describe('#union()', () => {

        it('should be an alias for concat()', () => {
            let iterable = new Iterable();
            assert.equal(iterable.union, iterable.concat);
        });

    });

    describe('#unique()', () => {

        it('should be an alias for distinct()', () => {
            let iterable = new Iterable();
            assert.equal(iterable.unique, iterable.distinct);
        });

    });

    describe('#where()', () => {

        it('should yield only elements passing a predicate', () => {
            let iterable = iter([1, 2, 3, 4, 5]).where(x => x % 2 === 0);
            assert.equal(iterable.toArray(), [2, 4]);
        });

    });

    describe('#while()', () => {

        it('should yield elements until a predicate fails', () => {
            let iterable = iter([1, 2, 3, 4, 5, -1, 6, 7, 8]).while(x => x > 0);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
        });

    });

    describe('#zip()', () => {

        it('should zip two iterables together by selector', () => {
            let iterable = iter([1, 2, 3, 4, 5]).zip([1, 3, 5, 7, 9], (x, y) => x + y);
            assert.equal(iterable.toArray(), [2, 5, 8, 11, 14]);
        });

        it('should only yield zipped elements until one iterable is finished', () => {
            let iter1 = iter([1, 2, 3]).zip([1, 2, 3, 4, 5, 6, 7], (x, y) => x + y);
            assert.equal(iter1.toArray(), [2, 4, 6]);

            let iter2 = iter([1, 2, 3, 4, 5, 6, 7]).zip([1, 2, 3], (x, y) => x + y);
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
            let iterable = iter(arr1).zip(arr2);
            assert.equal(iterable.toArray(), [
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

            let iterable = iter(arr1)
                .where(x => x.b === 3)
                .join(arr2)
                .where(([x, y]) => x.b === y.b)
                .select(([x, y]) => ({
                    a: x.a,
                    b: x.b,
                    c: x.c.concat(y.c),
                    d: y.d
                }))
                .distinct(x => iter(x.c).sum())
                .select(x => {
                    x.c = iter(x.c).sum();
                    return x;
                })
                .orderByDescending(x => x.d)
                .thenBy(x => x.c);
            assert.equal(iterable.toArray(), [
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
            let iterable = iter(arr1)
                .concat(arr1)
                .concat(arr1)
                .select(x => {
                    count++;
                    x.d = x.a + x.b;
                    return x;
                });
            let i = 0;
            let it = iterable[Symbol.iterator]();
            while (!it.next().done)
                assert.equal(++i, count);
            i *= 2;
            iterable.toArray();
            assert.equal(i, count);
        });

    });

    describe('reusability', () => {

        it('should be re-iterable with arrays', () => {
            let iterable = iter([1, 2, 3, 4, 5]);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
        });

        it('should be re-iterable with sets', () => {
            let iterable = iter(new Set([1, 2, 3, 4, 5]));
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
            assert.equal(iterable.toArray(), [1, 2, 3, 4, 5]);
        });

        it('should be re-iterable with maps', () => {
            let iterable = iter(new Map([['a', 1], ['b', 2], ['c', 3]]));
            assert.equal(iterable.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
            assert.equal(iterable.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
            assert.equal(iterable.toArray(), [['a', 1], ['b', 2], ['c', 3]]);
        });

        it('should be re-iterable with generator functions', () => {
            let iterable = iter(function*() { yield 1; yield 2; yield 3; });
            assert.equal(iterable.toArray(), [1, 2, 3]);
            assert.equal(iterable.toArray(), [1, 2, 3]);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should not be re-iterable with executed generator functions', () => {
            let iterable = iter(function*() { yield 1; yield 2; yield 3; }());
            assert.equal(iterable.toArray(), [1, 2, 3]);
            assert.equal(iterable.toArray(), []);
            assert.equal(iterable.toArray(), []);
        });

    });

});

describe('GroupedIterable', () => {

    describe('constructor()', () => {

        it('should accept a key and data', () => {
            let iterable = new GroupedIterable('key', [ 1, 2, 3 ]);
            assert.equal(iterable.key, 'key');
            assert.equal([ ...iterable ], [ 1, 2, 3 ]);
        });

    });

    describe('[toStringTag]', () => {

        it('should return \'GroupedIterable\'', () => {
            let iterable = new GroupedIterable();
            assert.equal(iterable[Symbol.toStringTag], 'GroupedIterable');
            assert.equal(Object.prototype.toString.call(iterable), '[object GroupedIterable]');
            assert.equal(Object.prototype.toString.call(GroupedIterable.prototype), '[object GroupedIterable]');
        });

    });

});

describe('MultiIterable', () => {

    describe('constructor()', () => {

        it('should accept multiple iterable items', () => {
            let iterable = new MultiIterable([1, 2], function*() { yield 3; yield 4; }, new Set([5, 6]));
            assert.equal(iterable.toArray(), [
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
            let iterable = new MultiIterable();
            assert.equal(iterable[Symbol.toStringTag], 'MultiIterable');
            assert.equal(Object.prototype.toString.call(iterable), '[object MultiIterable]');
            assert.equal(Object.prototype.toString.call(MultiIterable.prototype), '[object MultiIterable]');
        });

    });

    describe('#join()', () => {

        it('should dynamically join iterables', () => {
            let iterable = new MultiIterable([1, 2], [3, 4]);
            assert.equal(iterable.toArray(), [[1, 3], [1, 4], [2, 3], [2, 4]]);
            iterable = iterable.join([5, 6]);
            assert.equal(iterable.toArray(), [
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
            let iterable = new OrderedIterable([3, 1, 2]);
            assert.equal(iterable.toArray(), [1, 2, 3]);
        });

        it('should accept a custom selector', () => {
            let iterable = new OrderedIterable([3, 1, 2], x => -x);
            assert.equal(iterable.toArray(), [3, 2, 1]);
        });

        it('should accept a custom comparer', () => {
            let comparer = (x, y) => x > y ? -1 : x < y ? 1 : 0;
            let iterable = new OrderedIterable([3, 1, 2], undefined, comparer);
            assert.equal(iterable.toArray(), [3, 2, 1]);
        });

        it('should set descending by flag', () => {
            let iterable = new OrderedIterable([3, 1, 2], undefined, undefined, true);
            assert.equal(iterable.toArray(), [3, 2, 1]);
        });

    });

    describe('[toStringTag]', () => {

        it('should return \'OrderedIterable\'', () => {
            let iterable = new OrderedIterable();
            assert.equal(iterable[Symbol.toStringTag], 'OrderedIterable');
            assert.equal(Object.prototype.toString.call(iterable), '[object OrderedIterable]');
            assert.equal(Object.prototype.toString.call(OrderedIterable.prototype), '[object OrderedIterable]');
        });

    });

    describe('#thenBy()', () => {

        it('should add another order without altering previous orders', () => {
            let arr1 = [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ];

            let iterable = new OrderedIterable(arr1, x => x.num).thenBy(x => x.num2);
            assert.equal(iterable.toArray(), [
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ]);

            iterable = iterable.thenBy(x => x.num3);
            assert.equal(iterable.toArray(), [
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
            let iterable = iter(arr1)
                .orderBy(x => x.num)
                .thenBy(x => x.num2, (x, y) => x > y ? -1 : x < y ? 1 : 0);
            assert.equal(iterable.toArray(), [
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
            let iterable = iter(arr1)
                .orderBy(x => x.num)
                .thenBy(x => x.num2, undefined, true)
                .thenBy(x => x.num3, undefined, false);
            assert.equal(iterable.toArray(), [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 }
            ]);
        });

    });

    describe('#thenByDescending()', () => {

        it('should be a method for thenBy(selector, comparer, descending=true)', () => {
            let arr = [
                { id: 1, num: 11, num2: 44, num3: 88 },
                { id: 2, num: 22, num2: 44, num3: 66 },
                { id: 3, num: 22, num2: 33, num3: 77 },
                { id: 4, num: 11, num2: 33, num3: 99 },
                { id: 5, num: 22, num2: 44, num3: 55 }
            ];
            let iter1 = iter(arr).orderBy(x => x.num).thenBy(x => x.num2, undefined, true);
            let iter2 = iter(arr).orderBy(x => x.num).thenByDescending(x => x.num2);
            assert.equal(iter1.toArray(), iter2.toArray());
        });

    });

});
