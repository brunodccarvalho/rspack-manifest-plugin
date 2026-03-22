const { join } = require('path');

const test = require('ava');
const del = require('del');

const { compile } = require('../helpers/unit');

const outputPath = join(__dirname, '../output/integrity');

test.after(() => del(outputPath));

test('integrity option produces { src, integrity } entries when files have integrity', async (t) => {
  const config = {
    context: __dirname,
    entry: '../fixtures/file.js',
    output: {
      filename: '[name].js',
      path: join(outputPath, 'enabled')
    }
  };

  const { manifest } = await compile(config, t, {
    integrity: true,
    map: (file) => Object.assign({}, file, { integrity: 'sha384-test123' })
  });

  t.deepEqual(manifest, {
    'main.js': { integrity: 'sha384-test123', src: 'main.js' }
  });
});

test('integrity option disabled keeps plain string entries', async (t) => {
  const config = {
    context: __dirname,
    entry: '../fixtures/file.js',
    output: {
      filename: '[name].js',
      path: join(outputPath, 'disabled')
    }
  };

  const { manifest } = await compile(config, t, {
    integrity: false,
    map: (file) => Object.assign({}, file, { integrity: 'sha384-test123' })
  });

  t.deepEqual(manifest, { 'main.js': 'main.js' });
});

test('integrity option defaults to plain strings when not set', async (t) => {
  const config = {
    context: __dirname,
    entry: '../fixtures/file.js',
    output: {
      filename: '[name].js',
      path: join(outputPath, 'default')
    }
  };

  const { manifest } = await compile(config, t, {
    map: (file) => Object.assign({}, file, { integrity: 'sha384-test123' })
  });

  t.deepEqual(manifest, { 'main.js': 'main.js' });
});

test('integrity option with multiple files, partial integrity', async (t) => {
  const config = {
    context: __dirname,
    entry: {
      one: '../fixtures/file.js',
      two: '../fixtures/file-two.js'
    },
    output: {
      filename: '[name].js',
      path: join(outputPath, 'partial')
    }
  };

  const { manifest } = await compile(config, t, {
    integrity: true,
    map: (file) => {
      if (file.name === 'one.js') {
        return Object.assign({}, file, { integrity: 'sha384-abc' });
      }
      return file;
    }
  });

  t.deepEqual(manifest, {
    'one.js': { integrity: 'sha384-abc', src: 'one.js' },
    'two.js': 'two.js'
  });
});

test('integrity option with publicPath', async (t) => {
  const config = {
    context: __dirname,
    entry: '../fixtures/file.js',
    output: {
      filename: '[name].js',
      path: join(outputPath, 'public-path')
    }
  };

  const { manifest } = await compile(config, t, {
    integrity: true,
    map: (file) => Object.assign({}, file, { integrity: 'sha384-xyz' }),
    publicPath: '/assets/'
  });

  t.deepEqual(manifest, {
    'main.js': { integrity: 'sha384-xyz', src: '/assets/main.js' }
  });
});
