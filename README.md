# iterablejs

A functional, lazy-loading data manipulation library for Javascript.

```js
let result = new Iterable([1, 2, 3, 4, 5, 4, 3, 2, 1])
    .distinct()       // 1, 2, 3, 4, 5
    .select(x => x*2) // 2, 4, 6, 8, 10
    .reverse()        // 10, 8, 6, 4, 2
    .skip(1)          // 8, 6, 4, 2
    .take(2)          // 8, 6
    .average();       // 7
```

## Installation

```
npm install iterablejs
```

## Usage

An `Iterable` can wrap any item which defines `Symbol.iterator`, including an `Array`, `Map`, `Set`,  or `Generators`, and can also wrap `GeneratorFunctions` which do not require any arguments.

```js
import Iterable from 'iterablejs';

let iter1 = new Iterable([1, 2, 3]),
    iter2 = new Iterable(new Set([1, 2, 3, 1, 2])),
    iter3 = new Iterable(new Map([['a', 1], ['b', 2]])),
    iter4 = new Iterable(function*() { yield 1; yield 2; yield 3 }),
    iter5 = new Iterable({ *[Symbol.iterator]() { yield 1; yield 2; yield 3; }});
```

For convenience, `iterablejs` also exposes a method called `iter` to assist with constructing `Iterable` objects.

```js
import { iter } from 'iterablejs';
let iterable = iter([1, 2, 3, 4, 5]);
```

## Default task

* Install node.js
* Clone the iterablejs project
* Run `npm install`
* Run `gulp`
    * Executes tests
    * Cleans dist
    * Lints source
    * Builds source
    * Watches source and tests

## API

### Links

* Iterable
    * [#aggregate()](#aggregate)
    * [#any()](#any)
    * [#at()](#at)
    * [#average()](#average)
    * [#concat()](#concat)
    * [#contains()](#contains)
    * [#distinct()](#distinct)
    * [#empty()](#empty)
    * [#every()](#every)
    * [#filter()](#filter)
    * [#first()](#first)
    * [#firstOrDefault()](#firstordefault)
    * [#flatten()](#flatten)
    * [#full()](#full)
    * [#group()](#group)
    * [#groupBy()](#groupby)
    * [#intersect()](#intersect)
    * [.iter()](#iter)
    * [#join()](#join)
    * [#last()](#last)
    * [#lastOrDefault()](#lastordefault)
    * [#length()](#length)
    * [#map()](#map)
    * [#max()](#max)
    * [#merge()](#merge)
    * [#min()](#min)
    * [#orderBy()](#orderby)
    * [#orderByDescending()](#orderbydescending)
    * [#reduce()](#reduce)
    * [#reverse()](#reverse)
    * [#select()](#select)
    * [#skip()](#skip)
    * [#sum()](#sum)
    * [#take()](#take)
    * [#takeWhile()](#takewhile)
    * [#toArray()](#toarray)
    * [#union()](#union)
    * [#unionAll()](#unionall)
    * [#unwind()](#unwind)
    * [#where()](#where)
    * [#while()](#while)
    * [#zip()](#zip)
* MultiIterable
    * [#join()](#join)
* OrderedIterable
    * [#thenBy()](#thenby)
    * [#thenByDescending()](#thenbydescending)

### Iterable

#### #aggregate()

```js
aggregate(func: Function): Any
aggregate(func: Function, seed: Any): Any
```

Reduces an `Iterable` to a single value, using a callback and an optional seed value.

```js
let val = iter([2, 3, 4, 5])
    .aggregate((carry, current) => {
        return carry + current;
    }, 1);
//=> 15
```

If no seed value is provided, then the first yielded element will be used as the seed.

```js
let val = iter([1, 2, 3, 4, 5])
    .aggregate((carry, current) => {
        return carry + current;
    });
//=> 15
```

#### #any()

```js
any(predicate: Function): Boolean
```

Returns a boolean, indicating whether at least one of the values in the `Iterable` passes a given predicate.

```js
let passed = iter([1, 2, 3, 4, 5]).any(x => x > 3);
//=> true

let failed = iter([1, 2, 3, 4, 5]).any(x => x < 1);
//=> false
```

If no predicate is provided, then a check for null and undefined will be used.

```js
let passed = iter([null, undefined, 0]).any();
//=> true

let failed = iter([null, undefined, null]).any();
//=> false
```

#### #at()

```js
at(index: Number): Any
```

Returns the value at the provided zero-based index of yielded elements.

```js
let val = iter([1, 2, 3, 4, 5]).at(3);
//=> 4
```

If the index provided is beyond the length of the `Iterable`, then `undefined` will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).at(6);
//=> undefined
```

#### #average()

```js
average(): Number
average(selector: Function): Number
```

Returns the average of any numbers yielded by the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).average();
//=> 3
```

If a selector is provided, it will be used to select which elements are yielded.

```js
let val = iter([
    {a: 1, b: 2},
    {a: 3, b: 4},
    {a: 5, b: 6}
]).average(x => x.a);
//=> 3
```

If the `Iterable` is empty, then NaN will be returned.

```js
let val = iter([]).average();
//=> NaN
```

#### #concat()

```js
concat(...args): Iterable
```

Returns an `Iterable` which will iterate over the original iterable followed by all iterable arguments in sequence.

```js
let iterable = iter([1, 2]).concat(new Set([3, 4]), function*() { yield 5; yield 6; });
//=> 1, 2, 3, 4, 5, 6
```

#### #contains()

```js
contains(item: Any): Boolean
```

Returns a boolean indicating whether or not the `Iterable` contains a given element.

```js
let passed = iter([1, 2, 3, 4, 5]).contains(5);
//=> true

let failed = iter([1, 2, 3, 4, 5]).contains(0);
//=> false
```

Note that `contains` will use a deep equals method for comparison.

```js
let passed = iter([
    {a: 1, b: 2},
    {a: 3, b: 4},
    {a: 5, b: 6}
]).contains({a: 3, b: 4});
//=> true
```

#### #distinct()

```js
distinct(): Iterable
distinct(hasher: Function): Iterable
```

Returns an `Iterable` which will yield only distinct elements.

```js
let iterable = iter([1, 2, 3, 4, 5, 4, 3, 2, 1]).distinct();
//=> 1, 2, 3, 4, 5
```

Note that `distinct` uses a `Set` to determine if elements are unique. If a hasher is provided, it will be used to hash each element before adding it to the `Set`.

```js
let iterable = iter([{a: 1}, {a: 1}]).distinct();
//=> {a: 1}, {a, 1}

let iterable = iter([{a: 1}, {a: 1}]).distinct(x => x.a);
//=> {a: 1}
```

#### #empty()

```js
empty(): Boolean
```

Returns a boolean indicating whether or not every element yielded from the `Iterable` is considered empty.

```js
let passed = iter([
    null,
    undefined,
    false,
    0,
    '',
    [],
    new Set(),
    new Map()
]).empty();
//=> true

let failed = iter([0, null, undefined, 4, '', new Set(), new Map()]).empty();
//=> false
```

#### #every()

```js
every(): Boolean
every(predicate: Function): Boolean
```

Returns a boolean indicating whether or not every element yielded from the `Iterable` passes a given predicate.

```js
let passed = iter([1, 2, 3, 4, 5]).every(x => typeof x === 'number');
//=> true

let failed = iter([1, 2, '3', 4, 5]).every(x => typeof x === 'number');
//=> false
```

If no predicate is provided, then a check for null and undefined will be used.

```js
let failed = iter([1, 2, 3, null, 5]).every();
//=> false
```

#### #filter()

```js
filter(): Iterable
filter(predicate: Function): Iterable
```

An alias for [where](#where).

#### #first()

```js
first(): Any
first(predicate: Function): Any
```

Returns the first non-null, non-undefined element yielded from the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).first();
//=> 1
```

```js
let val = iter([null, 2, 3, 4, 5]).first();
//=> 2
```

If a predicate is provided, then the first element yielded from the `Iterable` which passes the predicate will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).first(x => x > 2);
//=> 3
```

If the `Iterable` does not yield any elements or if no elements pass a given predicate, then `undefined` will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).first(x => x > 5);
//=> undefined
```

#### #firstOrDefault()

```js
firstOrDefault(default: Any): Any
firstOrDefault(predicate: Function, default: Any): Any
```

Returns the first element yielded from the `Iterable`, or the default if no element is yielded.

```js
let val = iter([]).firstOrDefault(1);
//=> 1
```

If a predicate is provided, then the first element yielded from the `Iterable` which passes the predicate will be returned.
If no value passes the predicate, then the default will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).firstOrDefault(x => x > 5, 6);
//=> 6
```

#### #flatten()

```js
flatten(): Iterable
```

Returns an `Iterable` which yields a flattened list of elements.

```js
let iterable = iter([1, 2, 3, [4, 5, 6], [7, [8, [9]]]]).flatten();
//=> 1, 2, 3, 4, 5, 6, 7, 8, 9
```

#### #full()

```js
full(): Boolean
```

Returns a boolean indicating whether every element yielded from the `Iterable` is considered non-empty.

```js
let passed = iter([1, 2, 3, 4, 5]).full();
//=> true

let failed = iter([1, 2, 3, '', 5]).full();
//=> false
```

#### #group()

```js
group(keySelector: Function): Iterable
```

Returns an `Iterable` which yields the iterable grouping of elements based on the provided keySelector.

```js
let invoices = [
    { product: 1, price: 20, qty: 5, customer: 3 },
    { product: 1, price: 20, qty: 2, customer: 1 },
    { product: 1, price: 20, qty: 8, customer: 1 },
    { product: 2, price: 40, qty: 1, customer: 2 },
    { product: 3, price: 60, qty: 3, customer: 3 }
];

let grouped = iter(invoices)
    .group(invoice => invoice.product)
    .select(group => ({
        product: group.key,
        priceSum: group.sum(invoice => invoice.price * invoice.qty),
        qtySum: group.sum(invoice => invoice.qty),
        distinctCustomerCount: group.unique(invoice => invoice.customer).length(),
        recordCount: group.length()
    }))
    .orderBy(processed => processed.product);
/*=> { product: 1, priceSum: 300, qtySum: 15, distinctCustomerCount: 2, recordCount: 3 },
     { product: 2, priceSum: 40,  qtySum: 1,  distinctCustomerCount: 1, recordCount: 1 },
     { product: 3, priceSum: 180, qtySum: 3,  distinctCustomerCount: 1, recordCount: 1 } */
```

#### #groupBy()

```js
groupBy(keySelector: Function): Iterable
```

An alias for [group](#group).

#### #intersect()

```js
intersect(iter: Any): Iterable
intersect(iter: Any, selector: Function): Iterable
```

Returns an `Iterable` which yields the elements which exist in both `Iterables`.

```js
let iterable = iter([1, 2, 3, 4, 5]).intersect([1, 3, 5]);
//=> 1, 3, 5
```

If a selector is provided, then it will be used to determine the intersection.

```js
let iterable = iter([{a: 1}, {a: 2}, {a: 3}]).intersect([{a: 1}, {a: 3}], x => x.a);
//=> {a: 1}, {a: 3}
```

#### #join()

```js
join(...args): MultiIterable
```

Returns a `MultiIterable` which yields the cartesian product of all elements.

```js
let iterable = iter([1, 2]).join([3, 4], [5, 6]);
/*=> [ 1, 3, 5 ],
     [ 1, 3, 6 ],
     [ 1, 4, 5 ],
     [ 1, 4, 6 ],
     [ 2, 3, 5 ],
     [ 2, 3, 6 ],
     [ 2, 4, 5 ],
     [ 2, 4, 6 ] */
```

A `MultiIterable` can also call `#join()` with additional iterable items at any point.

```js
let iterable = iter([1, 2]).join([3, 4]);
/*=> [ 1, 3 ],
     [ 1, 4 ],
     [ 2, 3 ],
     [ 2, 4 ] */

iterable = iterable.join([5, 6]);
/*=> [ 1, 3, 5 ],
     [ 1, 3, 6 ],
     [ 1, 4, 5 ],
     [ 1, 4, 6 ],
     [ 2, 3, 5 ],
     [ 2, 3, 6 ],
     [ 2, 4, 5 ],
     [ 2, 4, 6 ] */
```

#### #last()

```js
last(): Any
last(predicate: Function): Any
```

Returns the last element yielded from the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).last();
//=> 5
```

If a predicate is provided, then the last element yielded from the `Iterable` which passes the predicate will be returned.

```js
let val = iter([5, 4, 3, 2, 1]).last(x => x > 2);
//=> 3
```

If the `Iterable` does not yield any elements or if no elements pass a given predicate, then `undefined` will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).last(x => x > 5);
//=> undefined
```

#### #lastOrDefault()

```js
lastOrDefault(default: Any): Any
lastOrDefault(predicate: Function, default: Any): Any
```

Returns the last element yielded from the `Iterable`, or the default if no element is yielded.

```js
let val = iter([]).lastOrDefault(1);
//=> 1
```

If a predicate is provided, then the last element yielded from the `Iterable` which passes the predicate will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).lastOrDefault(x => x < 3, 6);
//=> 2
```

If no value passes the predicate, then the default will be returned.

```js
let val = iter([1, 2, 3, 4, 5]).lastOrDefault(x => x > 5, 6);
//=> 6
```

#### #length()

```js
length(): Number
```

Returns the length of the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).length();
//=> 5
```

Note that if `length` is a property defined on the internal data and is a `Number`, then it will be used directly. If `length` is not available as a property, then the `Iterable` will be fully enumerated to determine length. 

#### #map()

```js
map(selector: Function): Iterable
```

An alias for [select](#select).

#### #max()

```js
max(): Number
max(selector: Function): Number
```

Returns the max of any numbers yielded by the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).max();
//=> 5
```

If a selector is provided, it will be used to select values for the comparison.

```js
let val = iter([
    {a: 1, b: 2},
    {a: 3, b: 4},
    {a: 5, b: 6}
]).max(x => x.b);
//=> 6
```

#### #merge()

```js
merge(iter: Any): Iterable
```

An alias for [zip](#zip).

#### #min()

```js
min(): Number
min(selector: Function): Number
```

Returns the min of any numbers yielded by the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).min();
//=> 1
```

If a selector is provided, it will be used to select values for the comparison.

```js
let val = iter([
    {a: 1, b: 2},
    {a: 3, b: 4},
    {a: 5, b: 6}
]).min(x => x.b);
//=> 2
```

#### #orderBy()

```js
orderBy(selector: Function): OrderedIterable
orderBy(selector: Function, comparer: Function): OrderedIterable
orderBy(selector: Function, comparer: Function, descending: Boolean): OrderedIterable
```

Returns an `OrderedIterable` which yields items in ascending order by using a stable quicksort.

```js
let iterable = iter([
    {a: 3, b: 4},
    {a: 1, b: 2},
    {a: 5, b: 6}
]).orderBy(x => x.a);
//=> {a: 1, b: 2}, {a: 3, b: 4}, {a: 5, b: 6}
```

If no comparer is provided, then the selected elements will be compared using `<` and `>`.

If a comparer *is* provided, it will be used instead.

```js
let comparer = (x, y) => {
    if (x > y)
        return -1;
    if (x < y)
        return 1;
    return 0;
};
let iterable = iter([
    {a: 3, b: 4},
    {a: 1, b: 2},
    {a: 5, b: 6}
]).orderBy(x => x.a, comparer);
//=> {a: 5, b: 6}, {a: 3, b: 4}, {a: 1, b: 2}
```

By default, `orderBy` will yield elements in an ascending order. If the `OrderedIterable` needs to yield elements in a reverse order, a boolean flag can be passed to flip the order.

```js
let iterable = iter([
    {a: 3, b: 4},
    {a: 1, b: 2},
    {a: 5, b: 6}
]).orderBy(x => x.a, undefined, true);
//=> {a: 5, b: 6}, {a: 3, b: 4}, {a: 1, b: 2}
```

#### #orderByDescending()

```js
orderByDescending(selector: Function): OrderedIterable
orderByDescending(selector: Function, comparer: Function): OrderedIterable
```

Returns an `OrderedIterable` which yields elements in descending order.

```js
let iterable = iter([
    {a: 3, b: 4},
    {a: 1, b: 2},
    {a: 5, b: 6}
]).orderByDescending(x => x.a);
//=> {a: 5, b: 6}, {a: 3, b: 4}, {a: 1, b: 2}
```

#### #reduce()

```js
reduce(func: Function): Any
reduce(func: Function, seed: Any): Any
```

An alias for [aggregate](#aggregate).

#### #reverse()

```js
reverse(): Iterable
```

Returns an `Iterable` which yields elements in a reverse order.

```js
let iterable = iter([1, 2, 3, 4, 5]).reverse();
//=> 5, 4, 3, 2, 1
```

#### #select()

```js
select(selector: Function): Iterable
```

Returns an `Iterable` which yields mapped elements from the given selector.

```js
let iterable = iter([
    {a: 1, b: 2},
    {a: 3, b: 4},
    {a: 5, b: 6}
]).select(x => x.a);
//=> 1, 3, 5
```

#### #skip()

```js
skip(): Iterable
skip(count: Number): Iterable
```

Returns an `Iterable` which bypasses the given number of elements and then yields the remainder.

```js
let iterable = iter([1, 2, 3, 4, 5]).skip(2);
//=> 3, 4, 5
```

If the given number is greater than the number of elements, then no items are yielded.

```js
let iterable = iter([1, 2, 3, 4, 5]).skip(6);
//=> (empty)
```

If no number is provided, then the next element will not be yielded from the `Iterable`.

```js
let iterable = iter([1, 2, 3, 4, 5]).skip();
//=> 2, 3, 4, 5
```

#### #sum()

```js
sum(): Number
sum(selector: Function): Number
```

Returns the sum of any numbers yielded by the `Iterable`.

```js
let val = iter([1, 2, 3, 4, 5]).sum();
//=> 15
```

If a selector is provided, it will be used to select values for the comparison.

```js
let val = iter([
    {a: 1, b: 2},
    {a: 3, b: 4},
    {a: 5, b: 6}
]).sum(x => x.b);
//=> 12
```

#### #take()

```js
take(): Iterable
take(count: Number): Iterable
```

Returns an `Iterable` which only yields the given number of elements.

```js
let iterable = iter([1, 2, 3, 4, 5]).take(3);
//=> 1, 2, 3
```

If the given number is greater than the number of elements, then all items are yielded.

```js
let iterable = iter([1, 2, 3, 4, 5]).take(6);
//=> 1, 2, 3, 4, 5
```

If no number is provided, then only the next element will be yielded from the `Iterable`.

```js
let iterable = iter([1, 2, 3, 4, 5]).take();
//=> 1
```

#### #takeWhile()

```js
takeWhile(): Iterable
takeWhile(predicate: Function): Iterable
```

An alias for [while](#while).

#### #toArray()

```js
toArray(): Array
```

Returns an `Array` containing every element yielded from the `Iterable`.

```js
let arr = iter(function*() { yield 1; yield 2; yield 3; }).toArray();
//=> [ 1, 2, 3 ]
```

#### #union()

```js
union(...args): Iterable
union(...args, hasher: Function): Iterable
```

Returns an `Iterable` which yields a union of all given iterables.

```js
let iterable1 = iter([ 1, 2, 3 ]);
let iterable2 = iter([ 3, 4, 5 ]);
let union = iterable1.union(iterable2);
//=> 1, 2, 3, 4, 5
```

If `hasher` callback is provided, then it will be used to determine uniqueness of the elements.

```js
let iterable1 = new Iterable([{ val: 1 }, { val: 2 }, { val: 3 }]);
let iterable2 = new Iterable([{ val: 3 }, { val: 4 }, { val: 5 }]);
let union = iterable1.union(iterable2, x => x.val);
/*=> { val: 1 },
     { val: 2 },
     { val: 3 },
     { val: 4 },
     { val: 5 } */
```

***Important:*** *Due to the dynamic nature of the arguments, avoid passing an iterable `Function` or `GeneratorFunction` as the final argument to `#union()`.*

*If you intend to use `Function` or `GeneratorFunction` as an iterable argument for `#union()`, consider either using `#concat()` followed by `#distinct()` instead, or wrapping each argument as an `Iterable` first.*

#### #unionAll()

```js
unionAll(...args): Iterable
```

An alias for [concat](#concat).

#### #unwind()

```js
unwind(selector: Function): Iterable
```

Uses the `selector` provided to pluck a sub-iterable out of a sequence of iterables, iterating over the selected piece and yielding a pair of the base and sub element for *each* of the sub elements.

```js
let iterable = new Iterable([
    { id: 1, arr: [ 'a', 'b' ] },
    { id: 2, arr: [ 'c', 'd' ] },
    { id: 3, arr: [ 'e', 'f' ] },
    { id: 4, arr: [ 'g', 'h' ] },
    { id: 5, arr: [ 'i', 'j' ] }
])
.unwind(x => x.arr);
/*=> [ { id: 1, arr: [ 'a', 'b' ] }, 'a' ],
     [ { id: 1, arr: [ 'a', 'b' ] }, 'b' ],
     [ { id: 2, arr: [ 'c', 'd' ] }, 'c' ],
     [ { id: 2, arr: [ 'c', 'd' ] }, 'd' ],
     [ { id: 3, arr: [ 'e', 'f' ] }, 'e' ],
     [ { id: 3, arr: [ 'e', 'f' ] }, 'f' ],
     [ { id: 4, arr: [ 'g', 'h' ] }, 'g' ],
     [ { id: 4, arr: [ 'g', 'h' ] }, 'h' ],
     [ { id: 5, arr: [ 'i', 'j' ] }, 'i' ],
     [ { id: 5, arr: [ 'i', 'j' ] }, 'j' ] */
```

No mutation or mapping of the base element is assumed. Typically, this method would be used with a further aggregation like `select()` in order to map elements as in the following example:

```js
let iterable = new Iterable([
    { id: 1, arr: [ 'a', 'b' ] },
    { id: 2, arr: [ 'c', 'd' ] },
    { id: 3, arr: [ 'e', 'f' ] },
    { id: 4, arr: [ 'g', 'h' ] },
    { id: 5, arr: [ 'i', 'j' ] }
])
.unwind(x => x.arr)
.select(([base, sub]) => ({
    id: base.id,
    letter: sub
}));
/*=> { id: 1, letter: 'a' },
     { id: 1, letter: 'b' },
     { id: 2, letter: 'c' },
     { id: 2, letter: 'd' },
     { id: 3, letter: 'e' },
     { id: 3, letter: 'f' },
     { id: 4, letter: 'g' },
     { id: 4, letter: 'h' },
     { id: 5, letter: 'i' },
     { id: 5, letter: 'j' } */
```

#### #where()

```js
where(): Iterable
where(predicate: Function): Iterable
```

Returns an `Iterable` which only yields elements which return `true` from the given predicate.

```js
let iterable = iter([1, 2, 3, 4, 5]).where(x => x % 2 === 0);
//=> 2, 4
```

If no predicate is provided, then null and undefined will not be yielded.

```js
let iterable = iter(['', 2, 0, 4, null]).where();
//=> '', 2, 0, 4
```

#### #while()

```js
while(): Iterable
while(predicate: Function): Iterable
```

Returns an `Iterable` which yields elements until a predicate returns `false`.

```js
let iterable = iter([1, 2, 3, 4, 5]).while(x => x < 4);
//=> 1, 2, 3
```

If no predicate is provided, then a check for null and undefined will be used.

```js
let iterable = iter([1, 2, 3, null, 5]).while();
//=> 1, 2, 3
```

#### #zip()

```js
zip(iter: Any, selector: Function): Iterable
```

Returns an `Iterable` which applies a function to both `Iterables`, yielding a sequence of the results.

```js
let iterable = iter([1, 2, 3, 4, 5]).zip([1, 2, 3, 4, 5], (x, y) => x + y);
//=> 2, 4, 6, 8, 10
```

#### .empty()

```js
Iterable.empty()
```

Returns an `Iterable` that does not yield any elements.

```js
let iterable = Iterable.empty();
//=> (empty)
```

#### .iter()

```js
iter(...args: any)
```

Constructs an `Iterable` from the given arguments.

```js
let iterable = Iterable.iter([1, 2, 3, 4, 5]);
//=> 1, 2, 3, 4, 5
```

If no arguments are provided, an empty `Iterable` is returned.

```js
let iterable = Iterable.iter();
//=> (empty)
```

If more than one argument is provided, a `MultiIterable` is returned.

```js
let iterable = Iterable.iter([1, 2], [3, 4]);
/*=> [1, 3],
     [1, 4],
     [2, 3],
     [2, 4] */
```

### OrderedIterable

#### #thenBy()

```js
thenBy(selector: Function): OrderedIterable
thenBy(selector: Function, comparer: Function): OrderedIterable
thenBy(selector: Function, comparer: Function, descending: Boolean): OrderedIterable
```

Returns an `OrderedIterable` with a subsequent level of sorting.

```js
let iterable = iter([
    { id: 1, num: 11, num2: 44, num3: 88 },
    { id: 2, num: 22, num2: 44, num3: 66 },
    { id: 3, num: 22, num2: 33, num3: 77 },
    { id: 4, num: 11, num2: 33, num3: 99 },
    { id: 5, num: 22, num2: 44, num3: 55 }
])
.orderBy(x => x.num)
.thenBy(x => x.num2);
/*=> { id: 4, num: 11, num2: 33, num3: 99 },
     { id: 1, num: 11, num2: 44, num3: 88 },
     { id: 3, num: 22, num2: 33, num3: 77 },
     { id: 2, num: 22, num2: 44, num3: 66 },
     { id: 5, num: 22, num2: 44, num3: 55 } */
```

This method is only available on an `OrderedIterable`, and can make use of a custom comparer and descending flag in the same way as `orderBy()`.

#### #thenByDescending()

```js
thenByDescending(selector: Function): OrderedIterable
thenByDescending(selector: Function, comparer: Function): OrderedIterable
```

Returns an `OrderedIterable` with a subsequent level of sorting in descending order.

```js
let iterable = iter([
    { id: 1, num: 11, num2: 44, num3: 88 },
    { id: 2, num: 22, num2: 44, num3: 66 },
    { id: 3, num: 22, num2: 33, num3: 77 },
    { id: 4, num: 11, num2: 33, num3: 99 },
    { id: 5, num: 22, num2: 44, num3: 55 }
])
.orderBy(x => x.num)
.thenByDescending(x => x.num2);
/*=> { id: 1, num: 11, num2: 44, num3: 88 },
     { id: 4, num: 11, num2: 33, num3: 99 },
     { id: 2, num: 22, num2: 44, num3: 66 },
     { id: 5, num: 22, num2: 44, num3: 55 },
     { id: 3, num: 22, num2: 33, num3: 77 } */
```