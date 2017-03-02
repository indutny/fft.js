'use strict';

const FFT = require('../');

console.time('construct');
const f = new FFT(8192);
console.timeEnd('construct');

const input = [];
for (let i = 0; i < f.length; i++)
  input[i] = Math.random();
const data = f.toComplexArray(input);

console.time('transform');
for (let i = 0; i < 3e3; i++)
  f.transform(data);
console.timeEnd('transform');
