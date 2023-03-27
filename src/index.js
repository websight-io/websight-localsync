#!/usr/bin/env node

import {join} from 'path';
import {setup} from './setup.js';
import {startDistWatcher, stopDistWatcher} from "./watch-dist.js";
import {getConfig} from "./handle-config.js";
import {clearFSSyncDirectory, startFsSync, stopFsSync} from "./sync.js";
import {execPromise, stopChildProcesses} from "./child-processes.js";

/**
 * @param {string} containerName name of the Docker container to prepare the sidecar for
 * @returns {Promise<void>} promise that resolves when the sidecar is prepared
 */
async function prepareSidecar(containerName) {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        bash ./prepare-sidecar.sh -c ${containerName}
    `);
}

/**
 * @param {string} containerName name of the Docker container to register the sidecar for
 * @returns {Promise<void>} promise that resolves when the sidecar is registered
 */
async function registerSidecar(containerName) {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        bash ./register-sidecar.sh -c ${containerName}
    `);
}

/**
 * @param {string} containerName name of the Docker container to unregister the sidecar from
 * @returns {Promise<void>} promise that resolves when the sidecar is unregistered
 */
async function unregisterSidecar(containerName) {
    await execPromise(`
        cd ./node_modules/websight-localsync/dist/scripts
        bash ./unregister-sidecar.sh -c ${containerName}
    `);
}

/**
 * @param {string} dir directory to start the file change watcher script in
 * @param {boolean} silent whether to suppress the output of the script
 * @returns {Promise<void>} promise that resolves when the watcher script is stopped
 */
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

/**
 * @returns {boolean} true if the --help argument was passed to the script
 */
function isHelpRequested() {
    return process.argv.includes('--help');
}

/**
 * Logs help message to the console
 */
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

/**
 * Tears down the environment when the script is stopped
 *
 * @param {Config} config configuration object
 */
async function handleExit(config) {
    if (config.docker) {
        stopDistWatcher();
        await unregisterSidecar(config.dockerContainerName);
    } else {
        console.log('\n=== Stopping sync with WS instance... ===');
        await stopFsSync();
    }
    stopChildProcesses();
    clearFSSyncDirectory();
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
        clearFSSyncDirectory();
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
            await startFsSync(false);

            console.log('=== Starting code changes watch... ===');
            await Promise.all(config.modules.map(module => startWatch(module.source, false)));
        }
    } catch (err) {
        console.log('=== Error occurred during sync setup. Please check the logs above for more details. ===');
        await handleExit(config);
    }
}

main();


