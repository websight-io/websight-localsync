#!/usr/bin/env node

import { join } from 'path';
import {exec} from 'child_process';
import {setup} from './setup.js';
import {startDistWatcher, stopDistWatcher} from "./watch-dist.js";
import {getConfig} from "./handleConfig.js";

const runningProcesses = [];

const execPromise = function (cmd, silent = false) {
    return new Promise((resolve, reject) => {
        const childProcess = exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
        runningProcesses.push(childProcess);
        const {stdout, stderr} = childProcess;
        if (!silent) {
            stdout.pipe(process.stdout);
            stderr.pipe(process.stderr);
        }
    });
}

async function prepareSidecar(containerName) {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        bash ./prepare-sidecar.sh -c ${containerName}
    `);
}
async function registerSidecar(containerName) {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        bash ./register-sidecar.sh -c ${containerName}
    `);
}

async function unregisterSidecar(containerName) {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        bash ./unregister-sidecar.sh -c ${containerName}
    `);
}

async function startWatch(dir = '.', silent = true) {
    try {
        await execPromise(`
            cd ${join(process.cwd(), dir)} &&
            npm run watch
        `, silent);
    } catch (e) {
        console.log('=== Watch has stopped ===', JSON.stringify(e, null, 2));
    }
}

function stopChildProcesses() {
    if (runningProcesses.length > 0) {
        console.log(`=== Stopping ${runningProcesses.length} background processes... ===`);
        runningProcesses.forEach(childProcess => {
            childProcess.kill('SIGINT');
        });
    }
}

function isHelpRequested() {
    return process.argv.includes('--help');
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

function handleExit(config) {
    if (config.docker) {
        unregisterSidecar(config.dockerContainerName);
        stopDistWatcher();
    } else {
        console.log('\n=== Stopping sync with WS instance... ===');
        stopFsSync();
    }
    stopChildProcesses();
}

async function main() {
    if (isHelpRequested()) {
        logHelpMessage();
        return;
    }

    const config = getConfig();

    let handlingExit = false;
    ['SIGINT'].forEach(event => {
        process.on(event, () => {
            if (!handlingExit) {
                handlingExit = true;
                handleExit(config);
            }
        });
    });

    try {
        if (config.docker) {
            console.log('=== Preparing environment for sidecar app... ===');
            await prepareSidecar(config.dockerContainerName);

            console.log('=== Registering sidecar app in CMS container... ===');
            await registerSidecar(config.dockerContainerName);

            console.log('=== Starting code changes watch... ===');
            config.modules.map(module => startWatch(module.source));

            startDistWatcher(config.modules);
        } else {
            console.log('=== Setting up the the server... ===');
            await setup();

            console.log('=== Starting sync with WS instance... ===');
            await startFsSync();

            console.log('=== Starting code changes watch... ===');
            await Promise.all(config.modules.map(module => startWatch(module.source, false)));
        }
    } catch (err) {
        console.log('=== Error occurred during sync setup. Please check the logs above for more details. ===');
        console.log(err);
        handleExit(config);
    }
}

main();


