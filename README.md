# FFT.js

Implementation of Radix-4 (and Radix-2) FFT.

## Usage

```js
const FFT = require('fft.js');

const f = new FFT(4096);

const input = new Array(4096);
input.fill(0);

const data = f.toComplexArray(input);
f.transform(data);
const output = f.fromComplexArray(data);

// For inverse - use:
f.inverseTransform(data);
```

## Benchmark

```
radix-2
[32] construct: 0.291ms
[32] transform 654957.34 ops/sec
[128] construct: 0.072ms
[128] transform 197276.71 ops/sec
[512] construct: 0.089ms
[512] transform 38549.19 ops/sec
[2048] construct: 1.620ms
[2048] transform 6869.82 ops/sec
[8192] construct: 1.159ms
[8192] transform 1124.28 ops/sec
radix-4
[64] construct: 0.051ms
[64] transform 458039.95 ops/sec
[256] construct: 0.049ms
[256] transform 176299.68 ops/sec
[1024] construct: 0.151ms
[1024] transform 32219.76 ops/sec
[4096] construct: 0.483ms
[4096] transform 5598.1 ops/sec
[16384] construct: 1.622ms
[16384] transform 764.15 ops/sec
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
