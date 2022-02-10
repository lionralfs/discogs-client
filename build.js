import fs from 'fs';
import { resolve } from 'path';
import { build } from 'esbuild';
import alias from 'esbuild-plugin-alias';

const PACKAGE = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// build for browser, esm
build({
    entryPoints: ['./lib/index.ts'],
    bundle: true,
    outfile: 'browser/index.js',
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    plugins: [
        alias({
            'node-fetch': resolve('./browser/fetch.js'),
        }),
    ],
    define: { 'process.env.VERSION_NUMBER': `'${PACKAGE.version}'` },
}).catch(err => console.error(err) || process.exit(1));

// build for node, esm
build({
    entryPoints: ['./lib/index.ts'],
    bundle: true,
    outfile: 'node-esm/index.js',
    format: 'esm',
    platform: 'node',
    target: ['node12'],
    minify: false,
    define: { 'process.env.VERSION_NUMBER': `'${PACKAGE.version}'` },
    external: ['node-fetch'],
}).catch(err => console.error(err) || process.exit(1));

// build for node, commonjs
build({
    entryPoints: ['./lib/index.ts'],
    bundle: true,
    outfile: 'commonjs/index.js',
    format: 'cjs',
    target: ['node12'],
    platform: 'node',
    minify: false,
    define: { 'process.env.VERSION_NUMBER': `'${PACKAGE.version}'` },
    external: ['node-fetch'],
}).catch(err => console.error(err) || process.exit(1));
