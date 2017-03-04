'use strict';

function FFT(size) {
  this.size = size;
  this._csize = size << 1;

  const table = new Float64Array(this.size * 2);
  for (let i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  let power = 0;
  let n;
  for (n = 1; n < size; n <<= 1)
    power++;
  if (n !== size)
    throw new Error('size must be a power of two');

  this._radix4 = power % 2 === 0;
  this._out = null;
  this._data = null;
  this._inv = 0;
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, arr) {
  const res = arr || new Array(complex.length >>> 1);
  for (let i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  return new Float64Array(this._csize);
};

FFT.prototype.toComplexArray = function toComplexArray(input, arr) {
  const res = arr || this.createComplexArray();
  for (let i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.transform = function transform(out, data) {
  this._out = out;
  this._data = data;
  this._inv = 1;
  if (this._radix4)
    this._transform4(0, 0, 2);
  else
    this._transform2(0, 0, 2);
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  this._out = out;
  this._data = data;
  this._inv = -1;
  if (this._radix4)
    this._transform4(0, 0, 2);
  else
    this._transform2(0, 0, 2);
  for (let i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-2 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform2 = function _transform2(outOff, off, step) {
  var out = this._out;
  var data = this._data;
  var inv = this._inv;

  var len = (this._csize / step) << 1;
  var halfLen = len >>> 1;
  var recStep = step << 1;

  if (len === 4) {
    // Just copy
    out[outOff] = data[off];
    out[outOff + 1] = data[off + 1];
    out[outOff + 2] = data[off + step];
    out[outOff + 3] = data[off + step + 1];
  } else {
    // Even
    this._transform2(outOff, off, recStep);
    // Odd
    this._transform2(outOff + halfLen, off + step, recStep);
  }

  // Combine
  var table = this.table;
  var limit = outOff + halfLen;
  for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
    const even = i;
    const odd = even + halfLen;

    const evenR = out[even];
    const evenI = out[even + 1];
    const oddR = out[odd];
    const oddI = out[odd + 1];

    const tableR = table[k];
    const tableI = inv * table[k + 1];

    const factorR = oddR * tableR - oddI * tableI;
    const factorI = oddR * tableI + oddI * tableR;

    const leftR = evenR + factorR;
    const leftI = evenI + factorI;
    const rightR = evenR - factorR;
    const rightI = evenI - factorI;

    out[even] = leftR;
    out[even + 1] = leftI;
    out[odd] = rightR;
    out[odd + 1] = rightI;
  }
};

// radix-4 implementation
FFT.prototype._transform4 = function _transform4(outOff, off, step) {
  var out = this._out;
  var data = this._data;
  var inv = this._inv;

  var len = (this._csize / step) << 1;
  var quarterLen = len >>> 2;
  var halfLen = len >>> 1;
  var threeQuarterLen = quarterLen + halfLen;
  var recStep = step << 2;

  var step2 = step * 2;
  var step3 = step * 3;
  if (len === 8) {
    out[outOff] = data[off];
    out[outOff + 1] = data[off + 1];
    out[outOff + 2] = data[off + step];
    out[outOff + 3] = data[off + step + 1];
    out[outOff + 4] = data[off + step2];
    out[outOff + 5] = data[off + step2 + 1];
    out[outOff + 6] = data[off + step3];
    out[outOff + 7] = data[off + step3 + 1];
  } else {
    // A
    this._transform4(outOff, off, recStep);
    // B
    this._transform4(outOff + quarterLen, off + step, recStep);
    // C
    this._transform4(outOff + halfLen, off + step2, recStep);
    // D
    this._transform4(outOff + threeQuarterLen, off + step3, recStep);
  }

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

    // Final values
    const FAr = MAr + MBr + MCr + MDr;
    const FAi = MAi + MBi + MCi + MDi;

    const FBr = MAr + inv * (MBi - MDi) - MCr;
    const FBi = MAi - inv  * (MBr - MDr) - MCi;

    const FCr = MAr - MBr + MCr - MDr;
    const FCi = MAi - MBi + MCi - MDi;

    const FDr = MAr - inv * (MBi - MDi) - MCr;
    const FDi = MAi + inv * (MBr - MDr) - MCi;

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
