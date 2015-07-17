# iterablejs

A functional, lazy-loading data manipulation library for Javascript.


	let result = new Iterable([1, 2, 3, 4, 5, 4, 3, 2, 1])
		.distinct()       // 1, 2, 3, 4, 5
		.select(x => x*2) // 2, 4, 6, 8, 10
	    .reverse()        // 10, 8, 6, 4, 2
		.skip(1)          // 8, 6, 4, 2
		.take(2)          // 8, 6
		.average();       // 7


## Installation
```
npm install iterablejs
```

## Usage

An `Iterable` can wrap any item which defines `Symbol.iterator`, including an `Array`, `Map`, `Set`,  or `Generators`, and can also wrap `GeneratorFunctions` which do not require any arguments.

	import Iterable from 'iterablejs';

	let iter1 = new Iterable([1, 2, 3]),
		iter2 = new Iterable(new Set([1, 2, 3, 1, 2])),
		iter3 = new Iterable(new Map([['a', 1], ['b', 2]])),
    	iter4 = new Iterable(function*() { yield 1; yield 2; yield 3 }),
        iter5 = new Iterable({ *[Symbol.iterator]() { yield 1; yield 2; yield 3; }});

For convenience, `iterablejs` also exposes a method called `from` to assist with constructing `Iterable` objects.

    import { from } from 'iterablejs';

	let iter = from([1, 2, 3, 4, 5]);

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

### Instance Methods
#### aggregate(func: Function, seed: Any): Any

Reduces an `Iterable` to a single value, using a callback and an optional seed value.

    let val = from([1, 2, 3, 4, 5])
		.aggregate((carry, current) => {
			return carry + current;
		});
	//=> 15

	let val2 = from([2, 3, 4, 5])
		.aggregate((carry, current) => {
			return carry + current;
		}, 1);
	//=> 15

#### any(predicate: Function): Boolean

Returns a boolean, indicating whether at least one of the values in the `Iterable` passes a given predicate.

	let passed = from([1, 2, 3, 4, 5]).any(x => x > 3);
	//=> true

	let failed = from([1, 2, 3, 4, 5]).any(x => x < 1);
	//=> false

If no predicate is provided, then `any` will look for at least one value which is not `null` or `undefined`.
	
	let passed = from([null, undefined, 0]).any();
	//=> true

	let failed = from([null, undefined, null]).any();
	//=> false

#### at(index: Number): Any

Returns the value at the provided zero-based index of yielded elements.

	let val = from([1, 2, 3, 4, 5]).at(3);
	//=> 4

If the index provided is beyond the length of the `Iterable`, then `undefined` will be returned.

	let val = from([1, 2, 3, 4, 5]).at(6);
	//=> undefined

#### average(selector: Function): Number

Returns the average of any numbers yielded by the `Iterable`.

    let val = from([1, 2, 3, 4, 5]).average();
	//=> 3

If a selector is provided, it will be used to select which elements are yielded.

	let val = from([
		{a: 1, b: 2},
		{a: 3, b: 4},
		{a: 5, b: 6}
	]).average(x => x.a);
	//=> 3

#### concat(...args): Iterable

Returns an `Iterable` which will iterate over the original iterable followed by all iterable arguments in sequence.

	let val = from([1, 2]).concat(new Set([3, 4]), function*() { yield 5; yield 6; });
	//=> 1, 2, 3, 4, 5, 6

#### contains(item: Any): Boolean

Returns a boolean indicating whether or not the `Iterable` contains a given element.

	let passed = from([1, 2, 3, 4, 5]).contains(5);
	//=> true
	
	let failed = from([1, 2, 3, 4, 5]).contains(0);
	//=> false

Note that by default, `contains` will use a deep equals method for comparison.

	let passed = from([
		{a: 1, b: 2},
		{a: 3, b: 4},
		{a: 5, b: 6}
	]).contains({a: 3, b: 4});
	//=> true

#### distinct(hasher: Function): Iterable

Returns an `Iterable` which will yield only distinct elements.

    let iter = from([1, 2, 3, 4, 5, 4, 3, 2, 1]).distinct();
	//=> 1, 2, 3, 4, 5

Note that `distinct` uses a `Set` to determine if elements are unique. If a hasher is provided, it will be used to hash each element before adding it to the `Set`.

	let iter = from([{a: 1}, {a: 1}]).distinct();
	//=> {a: 1}, {a, 1}

	let iter = from([{a: 1}, {a: 1}]).distinct(x => x.a);
	//=> {a: 1}

#### empty(): Boolean

Returns a boolean indicating whether or not every element yielded from the `Iterable` is considered empty.

	let iter = from([
		null,
		undefined,
		false,
		0,
		'',
		[]
	]).empty();
	//=> true

	let iter = from([1, 2, 3, 4, 5]).empty();
	//=> false

#### filter(predicate: Function): Iterable

An alias for `where`.

#### first(predicate: Function): Any

Returns the first element yielded from the `Iterable`.

	let val = from([1, 2, 3, 4, 5]).first();
	//=> 1

If a predicate is provided, then the first element yielded from the `Iterable` which passes the predicate will be returned.

	let val = from([1, 2, 3, 4, 5]).first(x => x > 2);
	//=> 3

If the `Iterable` yields no elements, or if no elements pass a given predicate, then `undefined` will be returned.

	let val = from([1, 2, 3, 4, 5]).first(x => x > 5);
	//=> undefined

#### flatten(): Iterable

Returns an `Iterable` which yields a flattened list of elements.

	let iter = from([1, 2, 3, [4, 5, 6], [7, [8, [9]]]]).flatten();
	//=> 1, 2, 3, 4, 5, 6, 7, 8, 9

#### full(): Boolean

Returns a boolean indicating whether every element yielded from the `Iterable` is considered non-empty.

	let iter = from([1, 2, 3, 4, 5]).full();
	//=> true

	let iter = from([1, 2, 3, null, 5]).full();
	//=> false

#### intersect(iter: Any, selector: Function): Iterable

Returns an `Iterable` which yields the elements which exist in both `Iterables`.

	let iter = from([1, 2, 3, 4, 5]).intersect([1, 3, 5]);
	//=> 1, 3, 5

If a selector is provided, then it will be used to determine the intersection.

	let iter = from([{a: 1}, {a: 2}, {a: 3}]).intersect([{a: 1}, {a: 3}], x => x.a);
	//=> {a: 1}, {a: 3}

#### join(...args): MultiIterable

Returns a `MultiIterable` which yields the cartesian product of all elements.

	let iter = from([1, 2]).join([3, 4], [5, 6]);
	//=> [ 1, 3, 5 ],
		 [ 1, 3, 6 ],
		 [ 1, 4, 5 ],
		 [ 1, 4, 6 ],
		 [ 2, 3, 5 ],
		 [ 2, 3, 6 ],
		 [ 2, 4, 5 ],
		 [ 2, 4, 6 ]

A `MultiIterable` can also call join more iterable items at any point.

	let iter = from([1, 2]).join([3, 4]);
	//=> [ 1, 3 ],
         [ 1, 4 ],
         [ 2, 3 ],
         [ 2, 4 ]

	iter = iter.join([5, 6]);
	//=> [ 1, 3, 5 ],
		 [ 1, 3, 6 ],
		 [ 1, 4, 5 ],
		 [ 1, 4, 6 ],
		 [ 2, 3, 5 ],
		 [ 2, 3, 6 ],
		 [ 2, 4, 5 ],
		 [ 2, 4, 6 ]

#### last(predicate: Function): Any

Returns the last element yielded from the `Iterable`.

	let val = from([1, 2, 3, 4, 5]).last();
	//=> 5

If a predicate is provided, then the last element yielded from the `Iterable` which passes the predicate will be returned.

	let val = from([5, 4, 3, 2, 1]).last(x => x > 2);
	//=> 3

If the `Iterable` yields no elements, or if no elements pass a given predicate, then `undefined` will be returned.

	let val = from([1, 2, 3, 4, 5]).last(x => x > 5);
	//=> undefined

#### length(): Number

Returns the length of the `Iterable`.

	let len = from([1, 2, 3, 4, 5]).length();
	//=> 5

Note that if `length` is a property defined on the internal data and is a `Number`, then it will be used directly. If `length` is not available as a property, then the `Iterable` will be fully enumerated to determine length. 

#### map(selector: Function): Iterable

An alias for `select`.

#### max(selector: Function): Number

Returns the max of any numbers yielded by the `Iterable`.

    let val = from([1, 2, 3, 4, 5]).max();
	//=> 5

If a selector is provided, it will be used to select values for the comparison.

	let val = from([
		{a: 1, b: 2},
		{a: 3, b: 4},
		{a: 5, b: 6}
	]).max(x => x.b);
	//=> 6

#### merge(iter: Any): Iterable

An alias for `zip`.

#### min(selector: Function): Number

Returns the min of any numbers yielded by the `Iterable`.

    let val = from([1, 2, 3, 4, 5]).min();
	//=> 1

If a selector is provided, it will be used to select values for the comparison.

	let val = from([
		{a: 1, b: 2},
		{a: 3, b: 4},
		{a: 5, b: 6}
	]).min(x => x.b);
	//=> 2

#### orderBy(selector: Function, comparer: Function, descending: Boolean): OrderedIterable

Returns an `OrderedIterable` which yields items in ascending order by using a stable quicksort.

	let iter = from([
		{a: 3, b: 4},
		{a: 1, b: 2},
		{a: 5, b: 6}
	]).orderBy(x => x.a);
	//=> {a: 1, b: 2}, {a: 3, b: 4}, {a: 5, b: 6}

If no comparer is provided, then the selected elements will be compared using `<` and `>`.

If a comparer *is* provided, it will be used instead.

	let comparer = (x, y) => {
	    if (x > y)
	        return -1;
	    if (x < y)
	        return 1;
	    return 0;
	};
	let iter = from([
	    {a: 3, b: 4},
	    {a: 1, b: 2},
	    {a: 5, b: 6}
	]).orderBy(x => x.a, comparer);
	//=> {a: 5, b: 6}, {a: 3, b: 4}, {a: 1, b: 2}

By default, `orderBy` will yield elements in an ascending order. If the `OrderedIterable` needs to yield elements in a reverse order, a boolean flag can be passed to flip the order.

	let iter = from([
	    {a: 3, b: 4},
	    {a: 1, b: 2},
	    {a: 5, b: 6}
	]).orderBy(x => x.a, undefined, true);
	//=> {a: 5, b: 6}, {a: 3, b: 4}, {a: 1, b: 2}

#### orderByDescending(selector: Function, comparer: Function): OrderedIterable

Returns an `OrderedIterable` which yields elements in descending order.

	let iter = from([
	    {a: 3, b: 4},
	    {a: 1, b: 2},
	    {a: 5, b: 6}
	]).orderByDescending(x => x.a);
	//=> {a: 5, b: 6}, {a: 3, b: 4}, {a: 1, b: 2}

#### reverse(): Iterable

Returns an `Iterable` which yields elements in a reverse order.

	let iter = from([1, 2, 3, 4, 5]).reverse();
	//=> 5, 4, 3, 2, 1

#### select(selector: Function): Iterable

Returns an `Iterable` which yields mapped elements from the given selector.

	let iter = from([
	    {a: 3, b: 4},
	    {a: 1, b: 2},
	    {a: 5, b: 6}
	]).select(x => x.a);
	//=> 1, 3, 5
	
#### skip(count: Number): Iterable

Returns an `Iterable` which bypasses the given number of elements and then yields the remainder.

	let iter = from([1, 2, 3, 4, 5]).skip(2);
	//=> 3, 4, 5

If the given number is greater than the number of elements, then no items are yielded.

	let iter = from([1, 2, 3, 4, 5]).skip(6);
	//=> (empty)

#### sum(selector: Function): Number

Returns the sum of any numbers yielded by the `Iterable`.

    let val = from([1, 2, 3, 4, 5]).sum();
	//=> 15

If a selector is provided, it will be used to select values for the comparison.

	let val = from([
		{a: 1, b: 2},
		{a: 3, b: 4},
		{a: 5, b: 6}
	]).sum(x => x.b);
	//=> 12

#### take(count: Number): Iterable

Returns an `Iterable` which only yields the given number of elements.

	let iter = from([1, 2, 3, 4, 5]).take(3);
	//=> 1, 2, 3

If the given number is greater than the number of elements, then all items are yielded.

	let iter = from([1, 2, 3, 4, 5]).skip(6);
	//=> 1, 2, 3, 4, 5

#### takeWhile(predicate: Function): Iterable

An alias for `while`.

#### thenBy(selector: Function, comparer: Function, descending: Boolean): OrderedIterable

Returns an `OrderedIterable` with a subsequent level of sorting.

	let iter = from([
        { id: 1, num: 11, num2: 44, num3: 88 },
        { id: 2, num: 22, num2: 44, num3: 66 },
        { id: 3, num: 22, num2: 33, num3: 77 },
        { id: 4, num: 11, num2: 33, num3: 99 },
        { id: 5, num: 22, num2: 44, num3: 55 }
    ])
	.orderBy(x => x.num)
	.thenBy(x => x.num2);
	//=> { id: 4, num: 11, num2: 33, num3: 99 },
		 { id: 1, num: 11, num2: 44, num3: 88 },
		 { id: 3, num: 22, num2: 33, num3: 77 },
		 { id: 2, num: 22, num2: 44, num3: 66 },
		 { id: 5, num: 22, num2: 44, num3: 55 }

This method is only available on an `OrderedIterable`, and can make use of a custom comparer and descending flag in the same way as `orderBy()`.

#### thenByDescending(selector: Function, comparer: Function): OrderedIterable

Returns an `OrderedIterable` with a subsequent level of sorting in descending order.

	let iter = from([
        { id: 1, num: 11, num2: 44, num3: 88 },
        { id: 2, num: 22, num2: 44, num3: 66 },
        { id: 3, num: 22, num2: 33, num3: 77 },
        { id: 4, num: 11, num2: 33, num3: 99 },
        { id: 5, num: 22, num2: 44, num3: 55 }
    ])
	.orderBy(x => x.num)
	.thenByDescending(x => x.num2);
	//=> { id: 1, num: 11, num2: 44, num3: 88 },
		 { id: 4, num: 11, num2: 33, num3: 99 },
		 { id: 2, num: 22, num2: 44, num3: 66 },
		 { id: 5, num: 22, num2: 44, num3: 55 },
		 { id: 3, num: 22, num2: 33, num3: 77 }

#### toArray(): Array

Returns an `Array` containing every element yielded from the `Iterable`.

	let arr = from(function*() { yield 1; yield 2; yield 3; }).toArray();
	//=> 1, 2, 3

#### union(...args): Iterable

An alias for `concat`.

#### where(predicate: Function): Iterable

Returns an `Iterable` which only yields elements which return `true` from the given predicate.

	let iter = from([1, 2, 3, 4, 5]).where(x => x % 2 === 0);
	//=> 2, 4

#### while(predicate: Function): Iterable

Returns an `Iterable` which yields elements until a predicate returns `false`.

	let iter = from([1, 2, 3, 4, 5]).while(x => x < 4);
	//=> 1, 2, 3

#### zip(iter: Any, selector: Function): Iterable

Returns an `Iterable` which applies a function to both `Iterables`, yielding a sequence of the results.

	let iter = from([1, 2, 3, 4, 5]).zip([1, 2, 3, 4, 5], (x, y) => x + y);
	//=> 2, 4, 6, 8, 10

### Static Methods

#### Iterable.from(...args: any)

Constructs an `Iterable` from the given arguments.

	let iter = from([1, 2, 3, 4, 5]);
	//=> 1, 2, 3, 4, 5

If no arguments are provided, an empty `Iterable` is returned.

	let iter = from();
	//=> (empty)

If more than one argument is provided, a `MultiIterable` is returned.

	let iter = Iterable.from([1, 2], [3, 4]);
	//=> [1, 3],
         [1, 4],
         [2, 3],
         [2, 4]

#### Iterable.wrap(...args: any)

An alias for `Iterable.from()`.

#### Iterable.empty

Returns an `Iterable` that does not yield any elements.

	let iter = Iterable.empty();
	//=> (empty)