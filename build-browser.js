import { resolve } from 'path';
import { build } from 'esbuild';
import alias from 'esbuild-plugin-alias';

build({
    entryPoints: ['./lib/index.js'],
    bundle: true,
    outfile: 'browser/index.js',
    format: 'esm',
    // minify: true,
    plugins: [
        alias({
            'node-fetch': resolve('./browser/fetch.js'),
        }),
    ],
}).catch(err => process.exit(1));
