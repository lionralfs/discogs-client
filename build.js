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
            crypto: resolve('./browser/crypto.js'),
        }),
    ],
    define: { 'process.env.VERSION_NUMBER': `'${PACKAGE.version}'` },
}).catch(err => console.error(err) || process.exit(1));

const commonBuildOptionsForNode = {
    entryPoints: ['./lib/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node14'],
    minify: false,
    define: { 'process.env.VERSION_NUMBER': `'${PACKAGE.version}'` },
    external: ['node-fetch'],
};

// build for node, esm
build({
    ...commonBuildOptionsForNode,
    outfile: 'node-esm/index.js',
    format: 'esm',
}).catch(err => console.error(err) || process.exit(1));

// build for node, commonjs
build({
    ...commonBuildOptionsForNode,
    outfile: 'commonjs/index.js',
    format: 'cjs',
}).catch(err => console.error(err) || process.exit(1));
