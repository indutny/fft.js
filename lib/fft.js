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

  // Buffer for de-interleaving
  this._tmp = new Float64Array(this.size * 2);
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, arr) {
  const res = arr || new Array(complex.length >>> 1);
  for (let i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, arr) {
  const res = arr || new Float64Array(this._csize);
  for (let i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.transform = function transform(data) {
  if (this._radix4)
    this._transform4(data, 0, 2, 1);
  else
    this._transform2(data, 0, 2, 1);
};

FFT.prototype.inverseTransform = function inverseTransform(data) {
  if (this._radix4)
    this._transform4(data, 0, 2, -1);
  else
    this._transform2(data, 0, 2, -1);
  for (let i = 0; i < data.length; i++)
    data[i] /= this.size;
};

// radix-2 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform2 = function _transform2(data, off, step, inv) {
  var len = this._csize | 0;
  var recStep = step << 1;
  if (recStep !== len) {
    // Even
    this._transform2(data, off, recStep, inv);
    // Odd
    this._transform2(data, off + step, recStep, inv);
  }

  // Combine
  var table = this.table;
  for (var i = off, k = 0; i < off + len; i += recStep, k += step) {
    const even = i;
    const odd = i + step;

    const evenR = data[even];
    const evenI = data[even + 1];
    const oddR = data[odd];
    const oddI = data[odd + 1];

    const tableR = table[k];
    const tableI = inv * table[k + 1];

    const factorR = oddR * tableR - oddI * tableI;
    const factorI = oddR * tableI + oddI * tableR;

    const leftR = evenR + factorR;
    const leftI = evenI + factorI;
    const rightR = evenR - factorR;
    const rightI = evenI - factorI;

    data[even] = leftR;
    data[even + 1] = leftI;
    data[odd] = rightR;
    data[odd + 1] = rightI;
  }

  // De-interleave
  var halfLen = len >>> 1;
  if (len === recStep)
    return;

  for (var i = off, j = off; i < len; i += recStep, j += step) {
    this._tmp[j + halfLen] = data[i + step];
    this._tmp[j + halfLen + 1] = data[i + step + 1];
    data[j] = data[i];
    data[j + 1] = data[i + 1];
  }
  for (var i = off + halfLen; i < off + len; i += step) {
    data[i] = this._tmp[i];
    data[i + 1] = this._tmp[i + 1];
  }
};

// radix-4 implementation
FFT.prototype._transform4 = function _transform4(data, off, step, inv) {
  var len = this._csize | 0;
  var recStep = step << 2;

  var step2 = step * 2;
  var step3 = step * 3;
  if (recStep !== len) {
    // A
    this._transform4(data, off, recStep, inv);
    // B
    this._transform4(data, off + step, recStep, inv);
    // C
    this._transform4(data, off + step2, recStep, inv);
    // D
    this._transform4(data, off + step3, recStep, inv);
  }

  // Combine
  var table = this.table;
  for (var i = off, k = 0; i < off + len; i += recStep, k += step) {
    const A = i;
    const B = i + step;
    const C = i + step2;
    const D = i + step3;

    // Original values
    const Ar = data[A];
    const Ai = data[A + 1];
    const Br = data[B];
    const Bi = data[B + 1];
    const Cr = data[C];
    const Ci = data[C + 1];
    const Dr = data[D];
    const Di = data[D + 1];

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

    data[A] = FAr;
    data[A + 1] = FAi;
    data[B] = FBr;
    data[B + 1] = FBi;
    data[C] = FCr;
    data[C + 1] = FCi;
    data[D] = FDr;
    data[D + 1] = FDi;
  }

  // De-interleave
  if (len === recStep)
    return;

  var quarterLen = len >>> 2;
  var halfLen = len >>> 1;
  var threeQuarterLen = quarterLen + halfLen;
  for (var i = off, j = off; i < len; i += recStep, j += step) {
    this._tmp[j + quarterLen] = data[i + step];
    this._tmp[j + quarterLen + 1] = data[i + step + 1];
    this._tmp[j + halfLen] = data[i + step2];
    this._tmp[j + halfLen + 1] = data[i + step2 + 1];
    this._tmp[j + threeQuarterLen] = data[i + step3];
    this._tmp[j + threeQuarterLen + 1] = data[i + step3 + 1];
    data[j] = data[i];
    data[j + 1] = data[i + 1];
  }
  for (var i = off + quarterLen; i < off + len; i += step) {
    data[i] = this._tmp[i];
    data[i + 1] = this._tmp[i + 1];
  }
};
