'use strict';

function FFT(size) {
  this.size = size | 0;
  if (this.size <= 0 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Float64Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  this._out = null;
  this._data = null;
  this._inv = 0;
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, arr) {
  var res = arr || new Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  return new Float64Array(this._csize);
};

FFT.prototype.toComplexArray = function toComplexArray(input, arr) {
  var res = arr || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4(0, 0, 2);
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = -1;
  this._transform4(0, 0, 2);
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4(outOff, off, step) {
  var out = this._out;
  var inv = this._inv;

  var len = (this._csize / step) << 1;

  // Non-recursive cases
  if (len === 4)
    return this._singleTransform2(outOff, off, step);
  else if (len === 8)
    return this._singleTransform4(outOff, off, step);

  var step2 = step * 2;
  var step3 = step * 3;
  var quarterLen = len >>> 2;
  var halfLen = len >>> 1;
  var threeQuarterLen = quarterLen + halfLen;
  var recStep = step << 2;

  // A
  this._transform4(outOff, off, recStep);
  // B
  this._transform4(outOff + quarterLen, off + step, recStep);
  // C
  this._transform4(outOff + halfLen, off + step2, recStep);
  // D
  this._transform4(outOff + threeQuarterLen, off + step3, recStep);

  // Combine
  var table = this.table;
  var limit = outOff + quarterLen;
  for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
    const A = i;
    const B = A + quarterLen;
    const C = B + quarterLen;
    const D = C + quarterLen;

    // Original values
    const Ar = out[A];
    const Ai = out[A + 1];
    const Br = out[B];
    const Bi = out[B + 1];
    const Cr = out[C];
    const Ci = out[C + 1];
    const Dr = out[D];
    const Di = out[D + 1];

    // Middle values
    const MAr = Ar;
    const MAi = Ai;

    const tableBr = table[k];
    const tableBi = inv * table[k + 1];
    const MBr = Br * tableBr - Bi * tableBi;
    const MBi = Br * tableBi + Bi * tableBr;

    const tableCr = table[2 * k];
    const tableCi = inv * table[2 * k + 1];
    const MCr = Cr * tableCr - Ci * tableCi;
    const MCi = Cr * tableCi + Ci * tableCr;

    const tableDr = table[3 * k];
    const tableDi = inv * table[3 * k + 1];
    const MDr = Dr * tableDr - Di * tableDi;
    const MDi = Dr * tableDi + Di * tableDr;

    // Pre-Final values
    const T0r = MAr + MCr;
    const T0i = MAi + MCi;
    const T1r = MAr - MCr;
    const T1i = MAi - MCi;
    const T2r = MBr + MDr;
    const T2i = MBi + MDi;
    const T3r = inv * (MBr - MDr);
    const T3i = inv * (MBi - MDi);

    // Final values
    const FAr = T0r + T2r;
    const FAi = T0i + T2i;

    const FCr = T0r - T2r;
    const FCi = T0i - T2i;

    const FBr = T1r + T3i;
    const FBi = T1i - T3r;

    const FDr = T1r - T3i;
    const FDi = T1i + T3r;

    out[A] = FAr;
    out[A + 1] = FAi;
    out[B] = FBr;
    out[B + 1] = FBi;
    out[C] = FCr;
    out[C + 1] = FCi;
    out[D] = FDr;
    out[D + 1] = FDi;
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Final values
  const FAr = Ar + Br + Cr + Dr;
  const FAi = Ai + Bi + Ci + Di;

  const FBr = Ar + inv * (Bi - Di) - Cr;
  const FBi = Ai - inv * (Br - Dr) - Ci;

  const FCr = Ar - Br + Cr - Dr;
  const FCi = Ai - Bi + Ci - Di;

  const FDr = Ar - inv * (Bi - Di) - Cr;
  const FDi = Ai + inv * (Br - Dr) - Ci;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};
