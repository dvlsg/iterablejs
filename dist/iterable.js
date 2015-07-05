/* eslint no-use-before-define: 0 */

/*
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _bind = require('babel-runtime/helpers/bind')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _Symbol$toStringTag = require('babel-runtime/core-js/symbol/to-string-tag')['default'];

var _Array$from = require('babel-runtime/core-js/array/from')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
var marked0$0 = [_reverse].map(_regeneratorRuntime.mark);

var _zanaUtil = require('zana-util');

var _zanaUtil2 = _interopRequireDefault(_zanaUtil);

var _zanaCheck = require('zana-check');

var _zanaCheck2 = _interopRequireDefault(_zanaCheck);

// const DATA = Symbol('data'); // swap this.data to use DATA instead
// let log = ::console.log;

function buildMapArray(count) {
    var mapArray = new Array(count);
    for (var i = 0; i < count; i++) {
        mapArray[i] = i;
    }return mapArray;
}

function buildKeyArray(elements, selector, count) {
    var keyArray = new Array(count);
    for (var i = 0; i < count; i++) {
        keyArray[i] = selector(elements[i]);
    }return keyArray;
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
    var k1 = keys[i1];
    var k2 = keys[i2];
    var c = comparer(k1, k2);
    if (c === 0) return i1 - i2;
    return c;
}

function quicksort(keys, map, comparer, left, right) {
    do {
        var i = left;
        var j = right;
        var x = map[i + (j - i >> 1)];
        // let p = keys[x];
        do {
            while (i < map.length && compareKeys(comparer, keys, x, map[i]) > 0) i++;
            while (j >= 0 && compareKeys(comparer, keys, x, map[j]) < 0) j--;
            if (i > j) break; // left index has crossed right index, stop the loop
            if (i < j) {
                ;var _ref = [map[j], map[i]];
                map[i] = _ref[0];
                map[j] = _ref[1];
            } // does this work?
            // swap(map, i, j); // swap the indexes in the map
            i++;
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

function _reverse(iter, a) {
    return _regeneratorRuntime.wrap(function _reverse$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (a.done) {
                    context$1$0.next = 4;
                    break;
                }

                return context$1$0.delegateYield(_reverse(iter, iter.next()), 't0', 2);

            case 2:
                context$1$0.next = 4;
                return a.value;

            case 4:
            case 'end':
                return context$1$0.stop();
        }
    }, marked0$0[0], this);
}

// lots of expanding here, may need some performance improvements
// consider detecting generatorFunctions with check.isIterable (somehow. es6 spec yet?)
function _flatten(item) {
    return _regeneratorRuntime.mark(function callee$1$0() {
        var prev, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, v;

        return _regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    prev = Iterable.expand(item);

                    if (_zanaCheck2['default'].isIterable(prev)) {
                        context$2$0.next = 6;
                        break;
                    }

                    context$2$0.next = 4;
                    return prev;

                case 4:
                    context$2$0.next = 36;
                    break;

                case 6:
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    context$2$0.prev = 9;
                    _iterator = _getIterator(prev);

                case 11:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        context$2$0.next = 22;
                        break;
                    }

                    v = _step.value;

                    if (!(!_zanaCheck2['default'].isIterable(v) && !_zanaCheck2['default'].instance(v, Function))) {
                        context$2$0.next = 18;
                        break;
                    }

                    context$2$0.next = 16;
                    return v;

                case 16:
                    context$2$0.next = 19;
                    break;

                case 18:
                    return context$2$0.delegateYield(Iterable.expand(_flatten(v)), 't0', 19);

                case 19:
                    _iteratorNormalCompletion = true;
                    context$2$0.next = 11;
                    break;

                case 22:
                    context$2$0.next = 28;
                    break;

                case 24:
                    context$2$0.prev = 24;
                    context$2$0.t1 = context$2$0['catch'](9);
                    _didIteratorError = true;
                    _iteratorError = context$2$0.t1;

                case 28:
                    context$2$0.prev = 28;
                    context$2$0.prev = 29;

                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }

                case 31:
                    context$2$0.prev = 31;

                    if (!_didIteratorError) {
                        context$2$0.next = 34;
                        break;
                    }

                    throw _iteratorError;

                case 34:
                    return context$2$0.finish(31);

                case 35:
                    return context$2$0.finish(28);

                case 36:
                case 'end':
                    return context$2$0.stop();
            }
        }, callee$1$0, this, [[9, 24, 28, 36], [29,, 31, 35]]);
    });
}

var Iterable = (function () {
    function Iterable(data) {
        _classCallCheck(this, Iterable);

        this.data = data || [];
    }

    _createClass(Iterable, [{
        key: _Symbol$iterator,
        value: function value() {
            return _getIterator(Iterable.expand(this.data)); // covers arrays, sets, generator functions, generators..
        }
    }, {
        key: 'aggregate',
        value: function aggregate() {
            var func = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];
            var seed = arguments[1] === undefined ? null : arguments[1];

            var iter = _getIterator(this);
            var result = null;
            if (seed === null) result = iter.next().value; // what about empty iterables?
            else result = func(seed, iter.next().value);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(iter), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var v = _step2.value;

                    result = func(result, v);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'any',
        value: function any() {
            var predicate = arguments[0] === undefined ? _zanaCheck2['default'].exists : arguments[0];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = _getIterator(this), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var v = _step3.value;

                    if (predicate(v)) return true;
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                        _iterator3['return']();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return false;
        }
    }, {
        key: 'at',
        value: function at(index) {
            if (_zanaCheck2['default'].instance(this.data, Array)) return this.data[index];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = _getIterator(this), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var v = _step4.value;

                    if (index-- === 0) return v;
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: 'average',
        value: function average() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var len = this.length();
            if (len === 0) return len;
            return this.sum(selector) / len;
        }
    }, {
        key: 'concat',
        value: function concat() {
            var iters = [this.data];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                for (var _iterator5 = _getIterator(args), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var arg = _step5.value;

                    if (arg instanceof Iterable) // a bit hacky... but functional. need to make sure we can use iter1.concat(iter1)
                        iters.push(arg.data);else iters.push(arg);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                        _iterator5['return']();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, iter, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, v;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            _iteratorNormalCompletion6 = true;
                            _didIteratorError6 = false;
                            _iteratorError6 = undefined;
                            context$3$0.prev = 3;
                            _iterator6 = _getIterator(iters);

                        case 5:
                            if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                context$3$0.next = 36;
                                break;
                            }

                            iter = _step6.value;
                            _iteratorNormalCompletion7 = true;
                            _didIteratorError7 = false;
                            _iteratorError7 = undefined;
                            context$3$0.prev = 10;
                            _iterator7 = _getIterator(Iterable.expand(iter));

                        case 12:
                            if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                                context$3$0.next = 19;
                                break;
                            }

                            v = _step7.value;
                            context$3$0.next = 16;
                            return v;

                        case 16:
                            _iteratorNormalCompletion7 = true;
                            context$3$0.next = 12;
                            break;

                        case 19:
                            context$3$0.next = 25;
                            break;

                        case 21:
                            context$3$0.prev = 21;
                            context$3$0.t0 = context$3$0['catch'](10);
                            _didIteratorError7 = true;
                            _iteratorError7 = context$3$0.t0;

                        case 25:
                            context$3$0.prev = 25;
                            context$3$0.prev = 26;

                            if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                                _iterator7['return']();
                            }

                        case 28:
                            context$3$0.prev = 28;

                            if (!_didIteratorError7) {
                                context$3$0.next = 31;
                                break;
                            }

                            throw _iteratorError7;

                        case 31:
                            return context$3$0.finish(28);

                        case 32:
                            return context$3$0.finish(25);

                        case 33:
                            _iteratorNormalCompletion6 = true;
                            context$3$0.next = 5;
                            break;

                        case 36:
                            context$3$0.next = 42;
                            break;

                        case 38:
                            context$3$0.prev = 38;
                            context$3$0.t1 = context$3$0['catch'](3);
                            _didIteratorError6 = true;
                            _iteratorError6 = context$3$0.t1;

                        case 42:
                            context$3$0.prev = 42;
                            context$3$0.prev = 43;

                            if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                                _iterator6['return']();
                            }

                        case 45:
                            context$3$0.prev = 45;

                            if (!_didIteratorError6) {
                                context$3$0.next = 48;
                                break;
                            }

                            throw _iteratorError6;

                        case 48:
                            return context$3$0.finish(45);

                        case 49:
                            return context$3$0.finish(42);

                        case 50:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[3, 38, 42, 50], [10, 21, 25, 33], [26,, 28, 32], [43,, 45, 49]]);
            });
            return this;
        }
    }, {
        key: 'contains',
        value: function contains(item) {
            var selector = arguments[1] === undefined ? function (x) {
                return x;
            } : arguments[1];

            var comparer = undefined;
            if (_zanaCheck2['default'].instance(item, Function)) comparer = function (x) {
                return item(x);
            };else comparer = _zanaUtil2['default'].equals;
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = _getIterator(this), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var v = _step8.value;

                    if (comparer(selector(v), item)) return true;
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                        _iterator8['return']();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            return false;
        }
    }, {
        key: 'distinct',
        value: function distinct() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var seen, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, v, selected;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            seen = new _Set();
                            _iteratorNormalCompletion9 = true;
                            _didIteratorError9 = false;
                            _iteratorError9 = undefined;
                            context$3$0.prev = 4;
                            _iterator9 = _getIterator(Iterable.expand(prev));

                        case 6:
                            if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                                context$3$0.next = 16;
                                break;
                            }

                            v = _step9.value;
                            selected = selector(v);

                            if (seen.has(selected)) {
                                context$3$0.next = 13;
                                break;
                            }

                            seen.add(selected);
                            context$3$0.next = 13;
                            return v;

                        case 13:
                            _iteratorNormalCompletion9 = true;
                            context$3$0.next = 6;
                            break;

                        case 16:
                            context$3$0.next = 22;
                            break;

                        case 18:
                            context$3$0.prev = 18;
                            context$3$0.t0 = context$3$0['catch'](4);
                            _didIteratorError9 = true;
                            _iteratorError9 = context$3$0.t0;

                        case 22:
                            context$3$0.prev = 22;
                            context$3$0.prev = 23;

                            if (!_iteratorNormalCompletion9 && _iterator9['return']) {
                                _iterator9['return']();
                            }

                        case 25:
                            context$3$0.prev = 25;

                            if (!_didIteratorError9) {
                                context$3$0.next = 28;
                                break;
                            }

                            throw _iteratorError9;

                        case 28:
                            return context$3$0.finish(25);

                        case 29:
                            return context$3$0.finish(22);

                        case 30:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[4, 18, 22, 30], [23,, 25, 29]]);
            });
            return this;
        }
    }, {
        key: 'empty',
        value: function empty() {
            return !this.any(function (x) {
                return !_zanaCheck2['default'].empty(x);
            });
        }
    }, {
        key: 'every',
        value: function every() {
            var predicate = arguments[0] === undefined ? _zanaCheck2['default'].empty : arguments[0];
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = _getIterator(this), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var v = _step10.value;

                    if (!predicate(v)) return false;
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10['return']) {
                        _iterator10['return']();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            return true;
        }
    }, {
        key: 'first',
        value: function first() {
            var predicate = arguments[0] === undefined ? _zanaCheck2['default'].exists : arguments[0];
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = _getIterator(this), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var v = _step11.value;

                    if (predicate(v)) return v;
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11['return']) {
                        _iterator11['return']();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            return undefined;
        }
    }, {
        key: 'flatten',
        value: function flatten() {
            var prev = this.data;
            this.data = _flatten(prev);
            return this;
        }
    }, {
        key: 'full',
        value: function full() {
            return !this.any(function (x) {
                return _zanaCheck2['default'].empty(x);
            });
        }
    }, {
        key: 'intersect',
        value: function intersect(iter) {
            var selector = arguments[1] === undefined ? function (x) {
                return x;
            } : arguments[1];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var set, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, v, selected;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            set = new _Set(Iterable.from(iter).select(selector).toArray());
                            _iteratorNormalCompletion12 = true;
                            _didIteratorError12 = false;
                            _iteratorError12 = undefined;
                            context$3$0.prev = 4;
                            _iterator12 = _getIterator(Iterable.expand(prev));

                        case 6:
                            if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                                context$3$0.next = 15;
                                break;
                            }

                            v = _step12.value;
                            selected = selector(v);

                            if (!set['delete'](selected)) {
                                context$3$0.next = 12;
                                break;
                            }

                            context$3$0.next = 12;
                            return v;

                        case 12:
                            _iteratorNormalCompletion12 = true;
                            context$3$0.next = 6;
                            break;

                        case 15:
                            context$3$0.next = 21;
                            break;

                        case 17:
                            context$3$0.prev = 17;
                            context$3$0.t0 = context$3$0['catch'](4);
                            _didIteratorError12 = true;
                            _iteratorError12 = context$3$0.t0;

                        case 21:
                            context$3$0.prev = 21;
                            context$3$0.prev = 22;

                            if (!_iteratorNormalCompletion12 && _iterator12['return']) {
                                _iterator12['return']();
                            }

                        case 24:
                            context$3$0.prev = 24;

                            if (!_didIteratorError12) {
                                context$3$0.next = 27;
                                break;
                            }

                            throw _iteratorError12;

                        case 27:
                            return context$3$0.finish(24);

                        case 28:
                            return context$3$0.finish(21);

                        case 29:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[4, 17, 21, 29], [22,, 24, 28]]);
            });
            return this;
        }
    }, {
        key: 'join',
        value: function join() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return new (_bind.apply(MultiIterable, [null].concat([this], args)))();
        }
    }, {
        key: 'last',
        value: function last(predicate) {
            if (_zanaCheck2['default'].type(this.data, _zanaUtil.types.array)) {
                if (_zanaCheck2['default'].instance(predicate, Function)) {
                    for (var i = this.data.length; i >= 0; i--) {
                        var v = this.data[i];
                        if (predicate(v)) return v;
                    }
                } else return this.data[this.data.length - 1];
            } else {
                // we could also take the easy way out and just convert
                // this.data to an array if it isn't already an array.

                // would use more memory, but GC should pick it up
                // immediately after the function anyways,
                // and would immensely simplify the logic here.

                var current = undefined,
                    previous = undefined,
                    result = undefined,
                    expanded = Iterable.expand(this.data);
                if (_zanaCheck2['default'].instance(predicate, Function)) {
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
    }, {
        key: 'length',
        value: function length() {
            // shortcut if we have length defined -- do we want to give sets/maps (`size`) the same treatment?
            if (this.data.length && _zanaCheck2['default'].type(this.data.length, _zanaUtil.types.number)) return this.data.length;
            var len = 0;
            var expanded = _getIterator(Iterable.expand(this.data));
            while (!expanded.next().done) len++;
            return len;
        }
    }, {
        key: 'max',
        value: function max() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var max = undefined;
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = _getIterator(this), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var v = _step13.value;

                    var num = selector(v);
                    if (_zanaCheck2['default'].type(num, _zanaUtil.types.number) && (max === undefined || num > max)) max = num;
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13['return']) {
                        _iterator13['return']();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            return max;
        }
    }, {
        key: 'min',
        value: function min() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var min = undefined;
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = _getIterator(this), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var v = _step14.value;

                    var num = selector(v);
                    if (_zanaCheck2['default'].type(num, _zanaUtil.types.number) && (min === undefined || num < min)) min = num;
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14['return']) {
                        _iterator14['return']();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }

            return min;
        }
    }, {
        key: 'orderBy',
        value: function orderBy() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];
            var comparer = arguments[1] === undefined ? function (x, y) {
                return x > y ? 1 : x < y ? -1 : 0;
            } : arguments[1];
            var descending = arguments[2] === undefined ? false : arguments[2];

            return new OrderedIterable(this, selector, comparer, descending);
        }
    }, {
        key: 'orderByDescending',
        value: function orderByDescending() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];
            var comparer = arguments[1] === undefined ? function (x, y) {
                return x > y ? 1 : x < y ? -1 : 0;
            } : arguments[1];

            return new OrderedIterable(this, selector, comparer, true);
        }
    }, {
        key: 'reverse',
        value: function reverse() {
            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var expanded;
                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            expanded = _getIterator(Iterable.expand(prev));
                            return context$3$0.delegateYield(_reverse(expanded, expanded.next()), 't0', 2);

                        case 2:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this);
            });
            return this;
        }
    }, {
        key: 'select',
        value: function select() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, v;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            _iteratorNormalCompletion15 = true;
                            _didIteratorError15 = false;
                            _iteratorError15 = undefined;
                            context$3$0.prev = 3;
                            _iterator15 = _getIterator(Iterable.expand(prev));

                        case 5:
                            if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                                context$3$0.next = 12;
                                break;
                            }

                            v = _step15.value;
                            context$3$0.next = 9;
                            return selector(v);

                        case 9:
                            _iteratorNormalCompletion15 = true;
                            context$3$0.next = 5;
                            break;

                        case 12:
                            context$3$0.next = 18;
                            break;

                        case 14:
                            context$3$0.prev = 14;
                            context$3$0.t0 = context$3$0['catch'](3);
                            _didIteratorError15 = true;
                            _iteratorError15 = context$3$0.t0;

                        case 18:
                            context$3$0.prev = 18;
                            context$3$0.prev = 19;

                            if (!_iteratorNormalCompletion15 && _iterator15['return']) {
                                _iterator15['return']();
                            }

                        case 21:
                            context$3$0.prev = 21;

                            if (!_didIteratorError15) {
                                context$3$0.next = 24;
                                break;
                            }

                            throw _iteratorError15;

                        case 24:
                            return context$3$0.finish(21);

                        case 25:
                            return context$3$0.finish(18);

                        case 26:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[3, 14, 18, 26], [19,, 21, 25]]);
            });
            return this;
        }
    }, {
        key: 'skip',
        value: function skip() {
            var count = arguments[0] === undefined ? 1 : arguments[0];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var a, i, expanded;
                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            a = undefined, i = 0, expanded = _getIterator(Iterable.expand(prev));

                            while (!(a = expanded.next()).done && i < count) i++;

                            if (a.done) {
                                context$3$0.next = 10;
                                break;
                            }

                            context$3$0.next = 5;
                            return a.value;

                        case 5:
                            if ((a = expanded.next()).done) {
                                context$3$0.next = 10;
                                break;
                            }

                            context$3$0.next = 8;
                            return a.value;

                        case 8:
                            context$3$0.next = 5;
                            break;

                        case 10:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this);
            });
            return this;
        }
    }, {
        key: 'sum',
        value: function sum() {
            var selector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var sum = 0;
            var _iteratorNormalCompletion16 = true;
            var _didIteratorError16 = false;
            var _iteratorError16 = undefined;

            try {
                for (var _iterator16 = _getIterator(this), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                    var v = _step16.value;

                    var num = selector(v);
                    if (_zanaCheck2['default'].type(num, _zanaUtil.types.number)) sum += num;
                }
            } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion16 && _iterator16['return']) {
                        _iterator16['return']();
                    }
                } finally {
                    if (_didIteratorError16) {
                        throw _iteratorError16;
                    }
                }
            }

            return sum;
        }
    }, {
        key: 'take',
        value: function take() {
            var count = arguments[0] === undefined ? 1 : arguments[0];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var i, _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, v;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            i = 0;
                            _iteratorNormalCompletion17 = true;
                            _didIteratorError17 = false;
                            _iteratorError17 = undefined;
                            context$3$0.prev = 4;
                            _iterator17 = _getIterator(Iterable.expand(prev));

                        case 6:
                            if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
                                context$3$0.next = 15;
                                break;
                            }

                            v = _step17.value;

                            if (!(count <= i++)) {
                                context$3$0.next = 10;
                                break;
                            }

                            return context$3$0.abrupt('break', 15);

                        case 10:
                            context$3$0.next = 12;
                            return v;

                        case 12:
                            _iteratorNormalCompletion17 = true;
                            context$3$0.next = 6;
                            break;

                        case 15:
                            context$3$0.next = 21;
                            break;

                        case 17:
                            context$3$0.prev = 17;
                            context$3$0.t0 = context$3$0['catch'](4);
                            _didIteratorError17 = true;
                            _iteratorError17 = context$3$0.t0;

                        case 21:
                            context$3$0.prev = 21;
                            context$3$0.prev = 22;

                            if (!_iteratorNormalCompletion17 && _iterator17['return']) {
                                _iterator17['return']();
                            }

                        case 24:
                            context$3$0.prev = 24;

                            if (!_didIteratorError17) {
                                context$3$0.next = 27;
                                break;
                            }

                            throw _iteratorError17;

                        case 27:
                            return context$3$0.finish(24);

                        case 28:
                            return context$3$0.finish(21);

                        case 29:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[4, 17, 21, 29], [22,, 24, 28]]);
            });
            return this;
        }
    }, {
        key: 'toArray',
        value: function toArray() {
            //// option 1
            // return Array.from(this);

            // option 2
            if (Array.isArray(this.data)) return this.data;
            return [].concat(_toConsumableArray(this));

            //// option 3
            // let arr = [];
            // for (let v of this)
            //     arr.push(v);
            // return arr;
        }
    }, {
        key: 'where',
        value: function where() {
            var predicate = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, v;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            _iteratorNormalCompletion18 = true;
                            _didIteratorError18 = false;
                            _iteratorError18 = undefined;
                            context$3$0.prev = 3;
                            _iterator18 = _getIterator(Iterable.expand(prev));

                        case 5:
                            if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
                                context$3$0.next = 13;
                                break;
                            }

                            v = _step18.value;

                            if (!predicate(v)) {
                                context$3$0.next = 10;
                                break;
                            }

                            context$3$0.next = 10;
                            return v;

                        case 10:
                            _iteratorNormalCompletion18 = true;
                            context$3$0.next = 5;
                            break;

                        case 13:
                            context$3$0.next = 19;
                            break;

                        case 15:
                            context$3$0.prev = 15;
                            context$3$0.t0 = context$3$0['catch'](3);
                            _didIteratorError18 = true;
                            _iteratorError18 = context$3$0.t0;

                        case 19:
                            context$3$0.prev = 19;
                            context$3$0.prev = 20;

                            if (!_iteratorNormalCompletion18 && _iterator18['return']) {
                                _iterator18['return']();
                            }

                        case 22:
                            context$3$0.prev = 22;

                            if (!_didIteratorError18) {
                                context$3$0.next = 25;
                                break;
                            }

                            throw _iteratorError18;

                        case 25:
                            return context$3$0.finish(22);

                        case 26:
                            return context$3$0.finish(19);

                        case 27:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[3, 15, 19, 27], [20,, 22, 26]]);
            });
            return this;
        }
    }, {
        key: 'while',
        value: function _while() {
            var predicate = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, v;

                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            _iteratorNormalCompletion19 = true;
                            _didIteratorError19 = false;
                            _iteratorError19 = undefined;
                            context$3$0.prev = 3;
                            _iterator19 = _getIterator(Iterable.expand(prev));

                        case 5:
                            if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
                                context$3$0.next = 14;
                                break;
                            }

                            v = _step19.value;

                            if (predicate(v)) {
                                context$3$0.next = 9;
                                break;
                            }

                            return context$3$0.abrupt('break', 14);

                        case 9:
                            context$3$0.next = 11;
                            return v;

                        case 11:
                            _iteratorNormalCompletion19 = true;
                            context$3$0.next = 5;
                            break;

                        case 14:
                            context$3$0.next = 20;
                            break;

                        case 16:
                            context$3$0.prev = 16;
                            context$3$0.t0 = context$3$0['catch'](3);
                            _didIteratorError19 = true;
                            _iteratorError19 = context$3$0.t0;

                        case 20:
                            context$3$0.prev = 20;
                            context$3$0.prev = 21;

                            if (!_iteratorNormalCompletion19 && _iterator19['return']) {
                                _iterator19['return']();
                            }

                        case 23:
                            context$3$0.prev = 23;

                            if (!_didIteratorError19) {
                                context$3$0.next = 26;
                                break;
                            }

                            throw _iteratorError19;

                        case 26:
                            return context$3$0.finish(23);

                        case 27:
                            return context$3$0.finish(20);

                        case 28:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this, [[3, 16, 20, 28], [21,, 23, 27]]);
            });
            return this;
        }
    }, {
        key: 'zip',
        value: function zip(iter) {
            var selector = arguments[1] === undefined ? function (x, y) {
                return (0, _zanaUtil.extend)(x, y);
            } : arguments[1];

            var prev = this.data;
            this.data = _regeneratorRuntime.mark(function callee$2$0() {
                var aIter, bIter, a, b;
                return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            aIter = _getIterator(Iterable.expand(prev));
                            bIter = _getIterator(Iterable.expand(iter));
                            a = undefined, b = undefined;

                        case 3:
                            if (!(!(a = aIter.next()).done && !(b = bIter.next()).done)) {
                                context$3$0.next = 8;
                                break;
                            }

                            context$3$0.next = 6;
                            return selector(a.value, b.value);

                        case 6:
                            context$3$0.next = 3;
                            break;

                        case 8:
                        case 'end':
                            return context$3$0.stop();
                    }
                }, callee$2$0, this);
            });
            return this;
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'Iterable';
        }
    }], [{
        key: 'empty',
        value: function empty() {
            return new Iterable([]);
        }
    }, {
        key: 'expand',
        value: function expand(iter) {
            if (iter && typeof iter === 'function') // could be mishandled. throw an error if iter() doesn't have [Symbol.iterator] defined?
                return iter();
            return iter;
        }
    }, {
        key: 'from',
        value: function from() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            if (args.length === 1) return new Iterable(args[0]);else if (args.length > 1) return new (_bind.apply(MultiIterable, [null].concat(args)))();else return Iterable.empty();
        }
    }]);

    return Iterable;
})();

exports['default'] = Iterable;

Iterable.wrap = Iterable.from;
Iterable.prototype.filter = Iterable.prototype.where;
Iterable.prototype.map = Iterable.prototype.select;
Iterable.prototype.merge = Iterable.prototype.zip;
Iterable.prototype.takeWhile = Iterable.prototype['while'];
Iterable.prototype.union = Iterable.prototype.concat;

var MultiIterable = (function (_Iterable) {
    function MultiIterable() {
        _classCallCheck(this, MultiIterable);

        _get(Object.getPrototypeOf(MultiIterable.prototype), 'constructor', this).call(this);
        this.iterables = [];
        this.join.apply(this, arguments);
        var self = this; // since we cant use arrow functions or bind with generators
        this.data = _regeneratorRuntime.mark(function callee$2$0() {
            var marked3$0, expanded, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, iter, iterate;

            return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        iterate = function iterate(index, accumulate) {
                            var _iteratorNormalCompletion21, _didIteratorError21, _iteratorError21, _iterator21, _step21, v;

                            return _regeneratorRuntime.wrap(function iterate$(context$4$0) {
                                while (1) switch (context$4$0.prev = context$4$0.next) {
                                    case 0:
                                        if (!(accumulate.length < expanded.length)) {
                                            context$4$0.next = 29;
                                            break;
                                        }

                                        _iteratorNormalCompletion21 = true;
                                        _didIteratorError21 = false;
                                        _iteratorError21 = undefined;
                                        context$4$0.prev = 4;
                                        _iterator21 = _getIterator(expanded[index]);

                                    case 6:
                                        if (_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done) {
                                            context$4$0.next = 13;
                                            break;
                                        }

                                        v = _step21.value;

                                        accumulate.push(v);
                                        return context$4$0.delegateYield(iterate(index + 1, accumulate), 't0', 10);

                                    case 10:
                                        _iteratorNormalCompletion21 = true;
                                        context$4$0.next = 6;
                                        break;

                                    case 13:
                                        context$4$0.next = 19;
                                        break;

                                    case 15:
                                        context$4$0.prev = 15;
                                        context$4$0.t1 = context$4$0['catch'](4);
                                        _didIteratorError21 = true;
                                        _iteratorError21 = context$4$0.t1;

                                    case 19:
                                        context$4$0.prev = 19;
                                        context$4$0.prev = 20;

                                        if (!_iteratorNormalCompletion21 && _iterator21['return']) {
                                            _iterator21['return']();
                                        }

                                    case 22:
                                        context$4$0.prev = 22;

                                        if (!_didIteratorError21) {
                                            context$4$0.next = 25;
                                            break;
                                        }

                                        throw _iteratorError21;

                                    case 25:
                                        return context$4$0.finish(22);

                                    case 26:
                                        return context$4$0.finish(19);

                                    case 27:
                                        context$4$0.next = 31;
                                        break;

                                    case 29:
                                        context$4$0.next = 31;
                                        return _Array$from(accumulate);

                                    case 31:
                                        // make a copy
                                        accumulate.pop(); // base and recursive case both need to pop

                                    case 32:
                                    case 'end':
                                        return context$4$0.stop();
                                }
                            }, marked3$0[0], this, [[4, 15, 19, 27], [20,, 22, 26]]);
                        };

                        marked3$0 = [iterate].map(_regeneratorRuntime.mark);
                        expanded = [];
                        _iteratorNormalCompletion20 = true;
                        _didIteratorError20 = false;
                        _iteratorError20 = undefined;
                        context$3$0.prev = 6;

                        for (_iterator20 = _getIterator(self.iterables); !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                            iter = _step20.value;

                            expanded.push(_Array$from(Iterable.expand(iter)));
                        }context$3$0.next = 14;
                        break;

                    case 10:
                        context$3$0.prev = 10;
                        context$3$0.t0 = context$3$0['catch'](6);
                        _didIteratorError20 = true;
                        _iteratorError20 = context$3$0.t0;

                    case 14:
                        context$3$0.prev = 14;
                        context$3$0.prev = 15;

                        if (!_iteratorNormalCompletion20 && _iterator20['return']) {
                            _iterator20['return']();
                        }

                    case 17:
                        context$3$0.prev = 17;

                        if (!_didIteratorError20) {
                            context$3$0.next = 20;
                            break;
                        }

                        throw _iteratorError20;

                    case 20:
                        return context$3$0.finish(17);

                    case 21:
                        return context$3$0.finish(14);

                    case 22:
                        return context$3$0.delegateYield(iterate(0, []), 't1', 23);

                    case 23:
                    case 'end':
                        return context$3$0.stop();
                }
            }, callee$2$0, this, [[6, 10, 14, 22], [15,, 17, 21]]);
        });
    }

    _inherits(MultiIterable, _Iterable);

    _createClass(MultiIterable, [{
        key: 'join',
        value: function join() {
            var _iteratorNormalCompletion22 = true;
            var _didIteratorError22 = false;
            var _iteratorError22 = undefined;

            try {
                for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                }

                for (var _iterator22 = _getIterator(args), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                    var v = _step22.value;

                    this.iterables.push(v);
                }
            } catch (err) {
                _didIteratorError22 = true;
                _iteratorError22 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion22 && _iterator22['return']) {
                        _iterator22['return']();
                    }
                } finally {
                    if (_didIteratorError22) {
                        throw _iteratorError22;
                    }
                }
            }

            return this;
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'MultiIterable';
        }
    }]);

    return MultiIterable;
})(Iterable);

exports.MultiIterable = MultiIterable;

var OrderedIterable = (function (_Iterable2) {
    function OrderedIterable(data) {
        var selector = arguments[1] === undefined ? function (x) {
            return x;
        } : arguments[1];
        var comparer = arguments[2] === undefined ? function (x, y) {
            return x > y ? 1 : x < y ? -1 : 0;
        } : arguments[2];
        var descending = arguments[3] === undefined ? false : arguments[3];

        _classCallCheck(this, OrderedIterable);

        _get(Object.getPrototypeOf(OrderedIterable.prototype), 'constructor', this).call(this, data);
        this.selector = selector;
        this.comparer = function (x, y) {
            var result = comparer(x, y);
            return descending ? -result : result;
        };
        // this.descending = descending;
        var prev = data;
        var self = this;
        this.data = _regeneratorRuntime.mark(function callee$2$0() {
            var expanded, elements, unsortedElements, unsortedCount, sortableElements, sortedCount, sortedKeys, sortedMap, i;
            return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        expanded = Iterable.expand(prev);
                        elements = [].concat(_toConsumableArray(expanded));
                        unsortedElements = elements.filter(function (x) {
                            return self.selector(x) == null;
                        });
                        unsortedCount = unsortedElements.length;
                        sortableElements = elements.filter(function (x) {
                            return self.selector(x) != null;
                        });
                        sortedCount = sortableElements.length;
                        sortedKeys = buildKeyArray(sortableElements, self.selector, sortedCount);
                        sortedMap = buildMapArray(sortedCount);

                        // todo: something with descending.
                        quicksort(sortedKeys, sortedMap, self.comparer, 0, sortedCount - 1);
                        i = 0;

                    case 10:
                        if (!(i < sortedCount)) {
                            context$3$0.next = 16;
                            break;
                        }

                        context$3$0.next = 13;
                        return sortableElements[sortedMap[i]];

                    case 13:
                        i++;
                        context$3$0.next = 10;
                        break;

                    case 16:
                        i = 0;

                    case 17:
                        if (!(i < unsortedCount)) {
                            context$3$0.next = 23;
                            break;
                        }

                        context$3$0.next = 20;
                        return unsortedElements[i];

                    case 20:
                        i++;
                        context$3$0.next = 17;
                        break;

                    case 23:
                    case 'end':
                        return context$3$0.stop();
                }
            }, callee$2$0, this);
        });
    }

    _inherits(OrderedIterable, _Iterable2);

    _createClass(OrderedIterable, [{
        key: 'thenBy',
        value: function thenBy() {
            var newSelector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];
            var newComparer = arguments[1] === undefined ? function (x, y) {
                return x > y ? 1 : x < y ? -1 : 0;
            } : arguments[1];
            var descending = arguments[2] === undefined ? false : arguments[2];

            // wrap the old selector in a new selector function
            // which will build all keys into a primary/secondary structure,
            // allowing the primary key selector to grow recursively
            // by appending new selectors on to the original selectors
            var oldSelector = this.selector; // store pointer to avoid accidental recursion
            this.selector = function (item) {
                return {
                    primary: oldSelector(item),
                    secondary: newSelector(item)
                };
            };

            // wrap the old comparer in a new comparer function
            // which will carry on down the line of comparers
            // in order until a non-zero is found,
            // or until we reach the last comparer
            var oldComparer = this.comparer; // store pointer to avoid accidental recursion
            this.comparer = function (compoundKeyA, compoundKeyB) {
                var result = oldComparer(compoundKeyA.primary, compoundKeyB.primary);
                if (result === 0) {
                    // ensure stability
                    var newResult = newComparer(compoundKeyA.secondary, compoundKeyB.secondary);
                    return descending ? -newResult : newResult;
                }
                return result;
            };
            return this;
        }
    }, {
        key: 'thenByDescending',
        value: function thenByDescending() {
            var newSelector = arguments[0] === undefined ? function (x) {
                return x;
            } : arguments[0];
            var newComparer = arguments[1] === undefined ? function (x, y) {
                return x > y ? 1 : x < y ? -1 : 0;
            } : arguments[1];

            return this.thenBy(newSelector, newComparer, true);
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'OrderedIterable';
        }
    }]);

    return OrderedIterable;
})(Iterable);

exports.OrderedIterable = OrderedIterable;
var from = Iterable.from;
exports.from = from;
var wrap = Iterable.wrap;
exports.wrap = wrap;
// convert to array off the top, since we will have to iterate back and forth