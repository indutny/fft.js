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

const out = f.createComplexArray();
```

If `data` has just real numbers as is the case when `toComplexArray` is
used - real FFT may be run to compute it 25% faster:
```js
const realInput = new Array(f.size);
f.realTransform(out, realInput);
```

`realTransform` fills just the left half of the `out`, so if the full
spectrum is needed (which is symmetric), do the following:
```js
f.completeSpectrum(out);
```

If `data` on other hand is a complex array:
```js
const data = f.toComplexArray(input);
f.transform(out, data);
```

Inverse fourier transform:
```js
f.inverseTransform(data, out);
```

## Benchmarks

```
$ npm run bench
===== table construction =====
    fft.js x 1,426 ops/sec ±0.70% (93 runs sampled)
  Fastest is fft.js
===== transform size=2048 =====
    fft.js x 35,153 ops/sec ±0.83% (94 runs sampled)
    jensnockert x 5,037 ops/sec ±0.98% (91 runs sampled)
    dsp.js x 23,143 ops/sec ±0.64% (96 runs sampled)
    drom x 14,372 ops/sec ±0.76% (92 runs sampled)
  Fastest is fft.js
===== transform size=4096 =====
    fft.js x 15,676 ops/sec ±0.76% (94 runs sampled)
    jensnockert x 3,864 ops/sec ±1.02% (93 runs sampled)
    dsp.js x 7,905 ops/sec ±0.50% (97 runs sampled)
    drom x 6,718 ops/sec ±0.78% (96 runs sampled)
  Fastest is fft.js
===== transform size=8192 =====
    fft.js x 6,896 ops/sec ±0.79% (96 runs sampled)
    jensnockert x 1,193 ops/sec ±0.73% (94 runs sampled)
    dsp.js x 2,300 ops/sec ±0.74% (95 runs sampled)
    drom x 3,164 ops/sec ±0.67% (95 runs sampled)
  Fastest is fft.js
===== transform size=16384 =====
    fft.js x 3,123 ops/sec ±0.84% (95 runs sampled)
    jensnockert x 855 ops/sec ±1.02% (92 runs sampled)
    dsp.js x 948 ops/sec ±0.70% (94 runs sampled)
    drom x 1,428 ops/sec ±0.56% (93 runs sampled)
  Fastest is fft.js
===== realTransform size=2048 =====
    fft.js x 47,511 ops/sec ±0.93% (91 runs sampled)
    fourier-transform x 34,859 ops/sec ±0.77% (93 runs sampled)
  Fastest is fft.js
===== realTransform size=4096 =====
    fft.js x 21,841 ops/sec ±0.70% (94 runs sampled)
    fourier-transform x 16,135 ops/sec ±0.39% (93 runs sampled)
  Fastest is fft.js
===== realTransform size=8192 =====
    fft.js x 9,665 ops/sec ±0.65% (95 runs sampled)
    fourier-transform x 6,456 ops/sec ±0.83% (93 runs sampled)
  Fastest is fft.js
===== realTransform size=16384 =====
    fft.js x 4,399 ops/sec ±0.82% (93 runs sampled)
    fourier-transform x 2,745 ops/sec ±0.68% (94 runs sampled)
  Fastest is fft.js
```

## API Details

### Constructor

```js
const FFT = require('fft.js');

const fft = new FFT(size);
```

NOTE: `size` MUST be a power of two and MUST be bigger than 1.

If you are looking to find the nearest power of 2 given the size of your dataset, here is a [good tutorial](https://stackoverflow.com/questions/466204/rounding-up-to-next-power-of-2/466256#466256)

### Input/Output formats and helper methods.

#### `fft.createComplexArray()`

Create an array of size equal to `fft.size * 2`.
This array contains `fft.size` complex numbers whose real and imaginary parts
are interleaved like this:

```js
const complexArray = [ real0, imaginary0, real1, imaginary1, ... ];
```

#### `fft.toComplexArray(realInput, /* optional */ storage)`

Use provided `storage` or create a new complex array and fill all
real slots with values from `realInput` array, and all imaginary slots with
zeroes.

_NOTE: Always provide `storage` for better performance and to avoid extra time
in Garbage Collection._

#### `fft.fromComplexArray(complexInput, /* optional */ storage)`

Use provided `storage` or create an array of size `fft.size` and fill it with
real values from the `complexInput`.

_NOTE: Imaginary values from `complexInput` are ignored. This is a convenience
method._

_NOTE: Always provide `storage` for better performance and to avoid extra time
in Garbage Collection._

#### `fft.completeSpectrum(spectrum)`

Fill the right half of `spectrum` complex array (See:
`fft.createComplexArray()`) with the complex conjugates of the left half:

```js
for (every every `i` between 1 and (N / 2 - 1))
  spectrum[N - i] = spectrum*[i]
```

_NOTE: This method may be used with `fft.realTransform()` if full output is
desired._

### FFT Methods

#### `fft.realTransform(output, input)`

Take array of real numbers `input` and perform FFT transformation on it, filling
the left half of the `output` with the real part of the Fourier Transform's complex output (See:
`fft.completeSpectrum()`).

_NOTE: Always use this method if the input for FFT transformation is real (has
no imaginary parts). It is about 40% faster to do such transformation this way._

_NOTE: `input` - real array of size `fft.size`, `output` - complex array (See:
`fft.createComplexArray()`)._

#### `fft.transform(output, input)`

Perform transformation on complex `input` array and store results in
the complex `output` array.

_NOTE: `input` and `output` are complex arrays (See:
`fft.createComplexArray()`)._

#### `fft.inverseTransform(output, input)`

Perform inverse Fourier transform on complex `input` array and store results in
the complex `output` array.

_NOTE: `input` and `output` are complex arrays (See:
`fft.createComplexArray()`)._

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
