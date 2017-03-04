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
    fft.js x 1,583 ops/sec ±1.71% (86 runs sampled)
  Fastest is fft.js
===== transform size=2048 =====
    fft.js x 22,155 ops/sec ±0.64% (92 runs sampled)
    jensnockert x 5,059 ops/sec ±0.77% (93 runs sampled)
    dsp.js x 20,033 ops/sec ±0.62% (94 runs sampled)
  Fastest is fft.js
===== transform size=4096 =====
    fft.js x 11,303 ops/sec ±0.67% (96 runs sampled)
    jensnockert x 3,907 ops/sec ±0.90% (95 runs sampled)
    dsp.js x 6,359 ops/sec ±0.77% (94 runs sampled)
  Fastest is fft.js
===== transform size=8192 =====
    fft.js x 4,616 ops/sec ±0.90% (93 runs sampled)
    jensnockert x 1,179 ops/sec ±0.70% (94 runs sampled)
    dsp.js x 2,705 ops/sec ±0.64% (95 runs sampled)
  Fastest is fft.js
===== transform size=16384 =====
    fft.js x 2,191 ops/sec ±0.99% (92 runs sampled)
    jensnockert x 850 ops/sec ±1.12% (90 runs sampled)
    dsp.js x 887 ops/sec ±0.69% (93 runs sampled)
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
