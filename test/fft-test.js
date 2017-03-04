'use strict';

const assert = require('assert');
const FFT = require('../');

function fixRound(r) {
  return Math.round(r * 1000) / 1000;
}

describe('FFT.js', () => {
  it('should compute tables', () => {
    const f = new FFT(8);

    assert.strictEqual(f.table.length, 16);
  });

  it('should create complex array', () => {
    const f = new FFT(4);

    assert.strictEqual(f.createComplexArray().length, 8);
  });

  it('should convert to complex array', () => {
    const f = new FFT(4);

    assert.deepEqual(f.toComplexArray([ 1, 2, 3, 4 ]),
                     [ 1, 0, 2, 0, 3, 0, 4, 0 ]);
  });

  it('should convert from complex array', () => {
    const f = new FFT(4);

    assert.deepEqual(f.fromComplexArray(f.toComplexArray([ 1, 2, 3, 4 ])),
                     [ 1, 2, 3, 4 ]);
  });

  it('should transform trivial radix-2 case', () => {
    const f = new FFT(2);

    const out = f.createComplexArray();
    let data = f.toComplexArray([ 0.5, -0.5 ]);
    f.transform(out, data);
    assert.deepEqual(out, [ 0, 0, 1, 0 ]);

    data = f.toComplexArray([ 0.5, 0.5 ]);
    f.transform(out, data);
    assert.deepEqual(out, [ 1, 0, 0, 0 ]);

    // Linear combination
    data = f.toComplexArray([ 1, 0 ]);
    f.transform(out, data);
    assert.deepEqual(out, [ 1, 0, 1, 0 ]);
  });

  it('should transform trivial case', () => {
    const f = new FFT(4);

    const out = f.createComplexArray();
    let data = f.toComplexArray([ 1, 0.707106, 0, -0.707106 ]);
    f.transform(out, data);
    assert.deepEqual(out.map(fixRound), [ 1, 0, 1, -1.414, 1, 0, 1, 1.414 ]);

    data = f.toComplexArray([ 1, 0, -1, 0 ]);
    f.transform(out, data);
    assert.deepEqual(out, [ 0, 0, 2, 0, 0, 0, 2, 0 ]);
  });

  it('should inverse-transform', () => {
    const f = new FFT(4);

    const out = f.createComplexArray();
    const data = f.toComplexArray([ 1, 0.707106, 0, -0.707106 ]);
    f.transform(out, data);
    // [ 1, 0, 1, -1.414212, 1, 0, 0.9999999999999999, 1.414212 ]
    assert.deepEqual(out.map(fixRound), [ 1, 0, 1, -1.414, 1, 0, 1, 1.414 ]);
    f.inverseTransform(data, out);
    assert.deepEqual(f.fromComplexArray(data), [ 1, 0.707106, 0, -0.707106 ]);
  });

  it('should transform big recursive case', () => {
    const input = [];
    for (let i = 0; i < 256; i++)
      input.push(i);

    const f = new FFT(input.length);

    const out = f.createComplexArray();
    let data = f.toComplexArray(input);
    f.transform(out, data);
    f.inverseTransform(data, out);
    assert.deepEqual(f.fromComplexArray(data).map(fixRound), input);
  });

  it('should transform big recursive radix-2 case', () => {
    const input = [];
    for (let i = 0; i < 128; i++)
      input.push(i);

    const f = new FFT(input.length);

    const out = f.createComplexArray();
    let data = f.toComplexArray(input);
    f.transform(out, data);
    f.inverseTransform(data, out);
    assert.deepEqual(f.fromComplexArray(data).map(fixRound), input);
  });
});
