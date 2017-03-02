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

  it('should transform trivial case', () => {
    const f = new FFT(2);

    let data = f.toComplexArray([ 0.5, -0.5 ]);
    f.transform(data);
    assert.deepEqual(data, [ 0, 0, 1, 0 ]);

    data = f.toComplexArray([ 0.5, 0.5 ]);
    f.transform(data);
    assert.deepEqual(data, [ 1, 0, 0, 0 ]);

    // Linear combination
    data = f.toComplexArray([ 1, 0 ]);
    f.transform(data);
    assert.deepEqual(data, [ 1, 0, 1, 0 ]);
  });

  it('should transform first recursive case', () => {
    const f = new FFT(4);

    let data = f.toComplexArray([ 1, 0.707106, 0, -0.707106 ]);
    f.transform(data);
    assert.deepEqual(data.map(fixRound), [ 1, 0, 1, -1.414, 1, 0, 1, 1.414 ]);

    data = f.toComplexArray([ 1, 0, -1, 0 ]);
    f.transform(data);
    assert.deepEqual(data, [ 0, 0, 2, 0, 0, 0, 2, 0 ]);
  });

  it('should inverse-transform', () => {
    const f = new FFT(4);

    const data = f.toComplexArray([ 1, 0.707106, 0, -0.707106 ]);
    f.transform(data);
    f.inverseTransform(data);
    assert.deepEqual(f.fromComplexArray(data), [ 1, 0.707106, 0, -0.707106 ]);
  });

  it('should transform big recursive case', () => {
    const input = [];
    for (let i = 0; i < 128; i++)
      input.push(i);

    const f = new FFT(input.length);

    let data = f.toComplexArray(input);
    f.transform(data);
    f.inverseTransform(data);
    assert.deepEqual(f.fromComplexArray(data).map(fixRound), input);
  });
});
