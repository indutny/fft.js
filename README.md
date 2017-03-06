# FFT.js
[![Build Status](https://secure.travis-ci.org/indutny/fft.js.svg)](http://travis-ci.org/indutny/fft.js)
[![NPM version](https://badge.fury.io/js/fft.js.svg)](https://badge.fury.io/js/fft.js)

Implementation of Radix-4 FFT.

## Usage

```js
const FFT = require('fft.js');

const f = new FFT(4096);

const input = new Array(4096);
input.fill(0);

const data = f.toComplexArray(input);
const out = f.createComplexArray();

f.transform(out, data);
console.log(out);
console.log(f.fromComplexArray(out));

// For inverse - use:
f.inverseTransform(data, out);
```

## Benchmark

```
$ npm run bench
===== table construction =====
    fft.js x 1,570 ops/sec ±1.88% (86 runs sampled)
  Fastest is fft.js
===== transform size=2048 =====
    fft.js x 23,345 ops/sec ±0.92% (93 runs sampled)
    jensnockert x 4,730 ops/sec ±0.70% (90 runs sampled)
    dsp.js x 22,658 ops/sec ±0.80% (93 runs sampled)
    drom x 14,597 ops/sec ±0.61% (93 runs sampled)
  Fastest is fft.js
===== transform size=4096 =====
    fft.js x 12,076 ops/sec ±0.81% (93 runs sampled)
    jensnockert x 3,322 ops/sec ±0.72% (91 runs sampled)
    dsp.js x 7,708 ops/sec ±0.58% (95 runs sampled)
    drom x 6,634 ops/sec ±0.73% (95 runs sampled)
  Fastest is fft.js
===== transform size=8192 =====
    fft.js x 4,978 ops/sec ±0.71% (94 runs sampled)
    jensnockert x 1,103 ops/sec ±0.56% (94 runs sampled)
    dsp.js x 2,901 ops/sec ±0.52% (93 runs sampled)
    drom x 3,122 ops/sec ±0.43% (96 runs sampled)
  Fastest is fft.js
===== transform size=16384 =====
    fft.js x 2,378 ops/sec ±1.02% (93 runs sampled)
    jensnockert x 721 ops/sec ±0.88% (90 runs sampled)
    dsp.js x 955 ops/sec ±0.38% (95 runs sampled)
    drom x 1,430 ops/sec ±0.64% (94 runs sampled)
  Fastest is fft.js
```

#### LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2017.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
