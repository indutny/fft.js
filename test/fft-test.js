'use strict';

const assert = require('assert');
const external = require('fft');
const FFT = require('../');

function fixRoundEqual(actual, expected) {
  function fixRound(r) {
    return Math.round(r * 1000) / 1000;
  }

  assert.strictEqual(actual.map(fixRound).join(':'),
                     expected.map(fixRound).join(':'));
}

describe('FFT.js', () => {
  it('should compute tables', () => {
    const f = new FFT(8);

    assert.strictEqual(f.table.length, 16);
  });

  it('should throw on invalid table size', () => {
    assert.throws(() => {
      new FFT(1);
    }, /bigger than 1/);

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
    assert.strictEqual(f.createComplexArray()[0], 0);
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
    fixRoundEqual(out, [ 1, 0, 1, -1.414, 1, 0, 1, 1.414 ]);

    data = f.toComplexArray([ 1, 0, -1, 0 ]);
    f.transform(out, data);
    assert.deepEqual(out, [ 0, 0, 2, 0, 0, 0, 2, 0 ]);
  });

  it('should inverse-transform', () => {
    const f = new FFT(4);

    const out = f.createComplexArray();
    const data = f.toComplexArray([ 1, 0.707106, 0, -0.707106 ]);
    f.transform(out, data);
    fixRoundEqual(out, [ 1, 0, 1, -1.414, 1, 0, 1, 1.414 ]);
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
    fixRoundEqual(f.fromComplexArray(data), input);
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
    fixRoundEqual(f.fromComplexArray(data), input);
  });

  function externalLib(generator, size) {
    it('should verify against other library', () => {
      const ex = new external.complex(size, false);

      const input = new Float64Array(size * 2);
      for (let i = 0; i < input.length; i += 2)
        input[i] = generator(i >>> 1);
      const expected = new Float64Array(size * 2);

      ex.simple(expected, input, 'complex');

      const self = new FFT(size);
      const out = self.createComplexArray();
      self.transform(out, input);
      fixRoundEqual(out, expected);
    });
  }

  function realVsComplex(generator, size) {
    it('should verify real transform against complex transform', () => {
      const complex = new FFT(size);

      const input = complex.createComplexArray();
      const realInput = new Array(size);
      for (let i = 0; i < input.length; i += 2) {
        input[i] = generator(i >>> 1);
        realInput[i >>> 1] = input[i];
      }
      const expected = complex.createComplexArray();

      complex.transform(expected, input, 'complex');

      const self = new FFT(size);
      const out = self.createComplexArray();
      self.realTransform(out, realInput);
      self.completeSpectrum(out);
      fixRoundEqual(out, expected);
    });
  }

  function realVsExternal(generator, size) {
    it('should verify real transform against other library', () => {
      const ex = new external.complex(size, false);

      const input = new Float64Array(size * 2);
      const realInput = new Array(size);
      for (let i = 0; i < input.length; i += 2) {
        input[i] = generator(i >>> 1);
        realInput[i >>> 1] = input[i];
      }
      const expected = new Float64Array(size * 2);

      ex.simple(expected, input, 'complex');

      const self = new FFT(size);
      const out = self.createComplexArray();
      self.realTransform(out, realInput);
      self.completeSpectrum(out);
      fixRoundEqual(out, expected);
    });
  }

  describe('cross-verify', () => {
    function ascending(i) {
      return i;
    }

    function sin(i) {
      return Math.sin(i);
    }

    function rand() {
      return (Math.random() - 0.5) * 2;
    }

    const sizes = [ 2, 4, 8, 16, 512, 1024, 2048, 4096 ];
    sizes.forEach((size) => {
      describe(`size=${size}`, () => {
        function every(generator) {
          externalLib(generator, size);
          realVsComplex(generator, size);
          realVsExternal(generator, size);
        }

        describe('ascending', () => {
          every(ascending);
        });

        describe('sin', () => {
          every(sin);
        });

        describe('rand', () => {
          every(rand);
        });
      });
    });
  });
});
