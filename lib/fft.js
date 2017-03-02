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

  // Buffer for de-interleaving
  this._tmp = new Float64Array(this.size * 2);
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex) {
  const res = new Array(complex.length >>> 1);
  for (let i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input) {
  const res = new Float64Array(this._csize);
  for (let i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.transform = function transform(data) {
  this._transform(data, 0, 2, 1);
};

FFT.prototype.inverseTransform = function inverseTransform(data) {
  this._transform(data, 0, 2, -1);
  for (let i = 0; i < data.length; i++)
    data[i] /= this.size;
};

// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform = function _transform(data, off, step, inv) {
  var len = this._csize | 0;
  var recStep = step << 1;
  if (recStep !== len) {
    // Even
    this._transform(data, off, recStep, inv);
    // Odd
    this._transform(data, off + step, recStep, inv);
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
