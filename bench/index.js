'use strict';

const FFT = require('../');

console.time('construct');
const f = new FFT(16384);
console.timeEnd('construct');

const input = [];
for (let i = 0; i < f.length; i++)
  input[i] = Math.random();
const data = f.toComplexArray(input);

const OPS = 3e3;

const start = process.hrtime();
for (let i = 0; i < OPS; i++)
  f.transform(data);
const delta = process.hrtime(start);

const deltaSec = delta[0] + delta[1] / 1e9;
console.log('transform %d ops/sec', (OPS / deltaSec).toFixed(2));
