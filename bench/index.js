'use strict';

const FFT = require('../');
const benchmark = require('benchmark');

function construct(size) {
  const suite = new benchmark.Suite();

  suite.add(`size=${size} construct`, () => {
    const f = new FFT(size);
  });

  return suite;
}

function transform(size) {
  const suite = new benchmark.Suite();

  const f = new FFT(size);
  const input = [];
  for (let i = 0; i < f.length; i++)
    input[i] = Math.random();
  const data = f.toComplexArray(input);
  const out = f.createComplexArray();

  suite.add(`size=${size} transform`, () => {
    f.transform(out, data);
  });

  return suite;
}

const benchmarks = [
  construct(16384),
  transform(2048),
  transform(4096),
  transform(8192),
  transform(16384)
];

benchmarks.forEach((suite) => {
  suite.on('cycle', (event) => {
    console.log(String(event.target));
  });
  suite.run();
});
