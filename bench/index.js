'use strict';

const FFT = require('../');
const external = {
  jensnockert: require('fft'),
  dspjs: require('dsp.js'),
  drom: require('fourier'),
  fourierTransform: require('fourier-transform')
};
const benchmark = require('benchmark');

function createInput(size) {
  const res = new Float64Array(size);
  for (let i = 0; i < res.length; i++)
    res[i] = Math.random();
  return res;
}

function construct(size) {
  const suite = new benchmark.Suite();

  suite.add('fft.js', () => {
    new FFT(size);
  });

  return suite;
}

function addSelf(suite, size) {
  const f = new FFT(size);
  const input = [];
  for (let i = 0; i < f.length; i++)
    input[i] = Math.random();
  const data = f.toComplexArray(input);
  const out = f.createComplexArray();

  suite.add('fft.js', () => {
    f.transform(out, data);
  });
}

function addJensNockert(suite, size) {
  const f = new external.jensnockert.complex(size, false);

  const input = createInput(size * 2);
  const output = new Float64Array(size * 2);

  suite.add('jensnockert', () => {
    f.simple(output, input, 'complex');
  });
}

function addDSPJS(suite, size) {
  const f = new external.dspjs.FFT(size, 44100);

  const input = createInput(size);
  suite.add('dsp.js', () => {
    f.forward(input);
  });
}

function addDrom(suite, size) {
  const heap = external.drom.custom.alloc(size, 3);
  const stdlib = {
    Math: Math,
    Float32Array: Float32Array,
    Float64Array: Float64Array
  };
  const f = new external.drom.custom[`fft_f64_${size}_asm`](stdlib, null, heap);

  f.init();

  suite.add('drom', () => {
    f.transform();
  });
}

function addFourierTransform(suite, size) {
  const forward = external.fourierTransform

  const input = createInput(size);
  suite.add('fourier-transform', () => {
    forward(input)
  })
}

function transform(size) {
  const suite = new benchmark.Suite();

  addSelf(suite, size);
  addJensNockert(suite, size);
  addDSPJS(suite, size);
  addDrom(suite, size);
  addFourierTransform(suite, size);

  return suite;
}

const benchmarks = [
  { title: 'table construction', suite: construct(16384) },
  { title: 'transform size=2048', suite: transform(2048) },
  { title: 'transform size=4096', suite: transform(4096) },
  { title: 'transform size=8192', suite: transform(8192) },
  { title: 'transform size=16384', suite: transform(16384) }
];

/* eslint-disable no-console */
benchmarks.forEach((bench) => {
  console.log('===== %s =====', bench.title);
  bench.suite.on('cycle', (event) => {
    console.log('    '+ String(event.target));
  }).on('complete', function() {
    console.log('  Fastest is ' + this.filter('fastest').map('name'));
  });
  bench.suite.run();
});
