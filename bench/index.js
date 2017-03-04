'use strict';

const FFT = require('../');

function bench(size) {
  console.time(`[${size}] construct`);
  const f = new FFT(size);
  console.timeEnd(`[${size}] construct`);

  const input = [];
  for (let i = 0; i < f.length; i++)
    input[i] = Math.random();
  const data = f.toComplexArray(input);
  const out = f.createComplexArray();

  const OPS = 3e3;

  const start = process.hrtime();
  for (let i = 0; i < OPS; i++)
    f.transform(out, data);
  const delta = process.hrtime(start);

  const deltaSec = delta[0] + delta[1] / 1e9;
  console.log('[%d] transform %d ops/sec', size, (OPS / deltaSec).toFixed(2));
}

console.log('radix-2');
bench(32);
bench(128);
bench(512);
bench(2048);
bench(8192);

console.log('radix-4');
bench(64);
bench(256);
bench(1024);
bench(4096);
bench(16384);
