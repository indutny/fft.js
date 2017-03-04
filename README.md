# FFT.js
[![Build Status](https://secure.travis-ci.org/indutny/fft.js.svg)](http://travis-ci.org/indutny/fft.js)
[![NPM version](https://badge.fury.io/js/fft.js.svg)](http://badge.fury.io/js/fft.js)

Implementation of Radix-4 (and Radix-2) FFT.

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
radix-2
[32] construct: 0.321ms
[32] transform 679130.37 ops/sec
[128] construct: 0.059ms
[128] transform 311321.42 ops/sec
[512] construct: 0.069ms
[512] transform 63313.65 ops/sec
[2048] construct: 0.336ms
[2048] transform 14221.73 ops/sec
[8192] construct: 1.082ms
[8192] transform 3100.01 ops/sec
radix-4
[64] construct: 0.037ms
[64] transform 572586.5 ops/sec
[256] construct: 0.040ms
[256] transform 244900.6 ops/sec
[1024] construct: 0.138ms
[1024] transform 49646.94 ops/sec
[4096] construct: 0.481ms
[4096] transform 10867.49 ops/sec
[16384] construct: 2.060ms
[16384] transform 1990.13 ops/sec
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
