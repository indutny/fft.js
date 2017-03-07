'use strict';

const assert = require('assert');
const external = require('fft');
const FFT = require('../');

function fixRound(r) {
  return Math.round(r * 1000) / 1000;
}

describe('FFT.js', () => {
  it('should compute tables', () => {
    const f = new FFT(8);

    assert.strictEqual(f.table.length, 16);
  });

  it('should throw on invalid table size', () => {
    assert.throws(() => {
      new FFT(9);
    }, /power of two/);

    assert.throws(() => {
      new FFT(7);
    }, /power of two/);

    assert.throws(() => {
      new FFT(3);
    }, /power of two/);

    assert.throws(() => {
      new FFT(0);
    }, /power of two/);

    assert.throws(() => {
      new FFT(-1);
    }, /power of two/);
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

  it('should throw on invalid transform inputs', () => {
    const f = new FFT(8);
    const output = f.createComplexArray();

    assert.throws(() => {
      f.transform(output, output);
    }, /must be different/);
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

  it('should verify against other library', () => {
    const sizes = [ 512, 1024, 2048, 4096 ];
    sizes.forEach((size) => {
      const ex = new external.complex(size, false);

      const input = new Float64Array(size * 2);
      for (let i = 0; i < input.length; i += 2)
        input[i] = i >>> 1;
      const expected = new Float64Array(size * 2);

      ex.simple(expected, input, 'complex');

      const self = new FFT(size);
      const out = self.createComplexArray();
      self.transform(out, input);
      assert.deepEqual(out.map(fixRound), expected.map(fixRound));
    });
  });
});
