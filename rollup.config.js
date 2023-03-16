import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";
import json from '@rollup/plugin-json';
import shebang from 'rollup-plugin-preserve-shebang';
import copy from 'rollup-plugin-copy'
import nativePlugin from 'rollup-plugin-natives';

const plugins = [
    nativePlugin({
        copyTo: 'dist/libs',
        destDir: './libs',
        targetEsm: true
    }),
    commonjs(),
    json(),
    nodeResolve({
        moduleDirectories: ['node_modules'],
    }),
    shebang(),
];

export default [
    {
        input: 'src/sidecar.js',
        output: {
            file: 'dist/sidecar.js'
        },
        plugins,
    }, {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js'
        },
        plugins: [
            ...plugins,
            copy({
                targets: [
                    { src: 'src/scripts/*', dest: 'dist/scripts' },
                ],
            }),
        ],
    }
];
