#!/usr/bin/env node

import {exec} from 'child_process';
import {setup} from './setup.js';
import {startDistWatcher, stopDistWatcher} from "./watch-dist.js";

const execPromise = function (cmd, silent = false) {
    return new Promise((resolve, reject) => {
        const {stdout, stderr} = exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
        if (!silent) {
            stdout.pipe(process.stdout);
            stderr.pipe(process.stderr);
        }
    });
}

async function prepareSidecar() {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        sh ./prepare-sidecar.sh
    `);
}
async function registerSidecar() {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        sh ./register-sidecar.sh
    `);
}

async function unregisterSidecar() {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        sh ./unregister-sidecar.sh
    `);
}

async function startWatch(silent = true) {
    try {
        await execPromise('npm run watch', silent);
    } catch (e) {
        console.log('=== Watch has stopped ===');
    }
}

function isHelpRequested() {
    return process.argv.includes('--help');
}

function isNoDocker() {
    return process.argv.includes('--no-docker');
}

function logHelpMessage() {
//     console.log(`
// Usage: run "npx websight-localsync [option...]" or configure it as a script entry in package.json:
//
//     "scripts": {
//         ...
//         "sync": "websight-localsync [option...]"
//     }
//
// Options:
//     target-folder: folder where the resources that we want to sync can be found. Default: ${defaultDistDirPrefix}/ + the name of the project
//     provider-root-suffix: the path under ${providerRootPrefix} where the synced resources will be copied. Default: the name of the project
//
// Example: our resources can be found under dist folder and inside the JCR repository we want to see them under /dev/apps/my-site/web_resources.
//     Run "npx websight-localsync target-folder=dist provider-root-suffix=my-site/web_resources" or configure it as a script entry in package.json:
//
//     "scripts": {
//         ...
//         "sync": "websight-localsync target-folder=dist provider-root-suffix=my-site/web_resources"
//     }`);
    // TODO: add help message
    console.log('=== Help message is not available yet. ===');
}

function handleExit() {
    if (isNoDocker()) {
        console.log('\n=== Stopping sync with WS instance... ===');
        stopFsSync();
    } else {
        unregisterSidecar();
        stopDistWatcher();
    }
}

async function main() {
    if (isHelpRequested()) {
        logHelpMessage();
        return;
    }

    let handlingExit = false;
    ['SIGINT'].forEach(event => {
        process.on(event, () => {
            if (!handlingExit) {
                handlingExit = true;
                handleExit();
            }
        });
    });

    try {
        if (isNoDocker()) {
            console.log('=== Setting up the the server... ===');
            await setup();

            console.log('=== Starting sync with WS instance... ===');
            await startFsSync();

            console.log('=== Starting code changes watch... ===');
            await startWatch(false);
        } else {
            console.log('=== Preparing environment for sidecar app... ===');
            await prepareSidecar();

            console.log('=== Registering sidecar app in CMS container... ===');
            await registerSidecar();

            // TODO multiple watch processes based on config
            console.log('=== Starting code changes watch... ===');
            startWatch();

            startDistWatcher();
        }
    } catch (err) {
        console.log('=== Error occurred during sync setup. Please check the logs above for more details. ===');
        handleExit();
    }
}

main();


