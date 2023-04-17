#!/usr/bin/env node
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import setup from './setup';
import { startDistWatcher, stopDistWatcher } from './watch-dist';
import getConfig, {
    DEFAULT_CONTAINER_NAME,
    DEFAULT_DIST_PREFIX,
    DEFAULT_SOURCE,
} from './handle-config';
import { clearFSSyncDirectory, startFsSync, stopFsSync } from './sync';
import { execPromise, stopChildProcesses } from './child-processes';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
const getScriptsDir = () => join(__dirname, 'scripts');

/**
 * @param {string} containerName name of the Docker container to prepare the sidecar for
 * @returns {Promise<void>} promise that resolves when the sidecar is prepared
 */
async function prepareSidecar(containerName) {
    await execPromise(`
        cd ${getScriptsDir()}
        bash ./prepare-sidecar.sh -c ${containerName}
    `);
}

/**
 * @param {string} containerName name of the Docker container to register the sidecar for
 * @returns {Promise<void>} promise that resolves when the sidecar is registered
 */
async function registerSidecar(containerName) {
    await execPromise(`
        cd ${getScriptsDir()}
        bash ./register-sidecar.sh -c ${containerName}
    `);
}

/**
 * @param {string} containerName name of the Docker container to unregister the sidecar from
 * @returns {Promise<void>} promise that resolves when the sidecar is unregistered
 */
async function unregisterSidecar(containerName) {
    await execPromise(`
        cd ${getScriptsDir()}
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
        await execPromise(
            `
            cd ${join(process.cwd(), dir)} &&
            npm run watch
        `,
            silent
        );
    } catch (e) {
        if (e.signal !== 'SIGINT') {
            console.log('=== Watch has stopped ===', e);
        }
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
    console.log(`
    Usage: run "npx websight-localsync [options]" or configure it as a script entry in package.json:

    "scripts": {
        ...
        "sync": "websight-localsync [options]"
    }
    
    Options take precedence over the config file.

    Options:
        --no-docker: CMS is not running in a Docker container (Default: true)
        --container-name: name of the Docker container where the CMS is running (Default: "${DEFAULT_CONTAINER_NAME}")
        --source: path to the source directory of the module/project to sync (Default: "${DEFAULT_SOURCE}")
        --dist: path to the dist directory of the module/project to sync (under the "source" directory) (Default: "${DEFAULT_DIST_PREFIX}")
        --target-dir: path to the directory where the synced files should be provided (Default: derived from the "source" directory's path's last part, e.g. dspl-website)
    
    Config file:
        You can also create a ".ws-localsync.json" file in the root directory of your project to configure the sync.
        To sync multiple modules at ones, it's necessary to create a config file.
        The file should contain a JSON object with the following properties:
        {
            "docker": boolean, // default: true
            "dockerContainerName": string, // default: "${DEFAULT_CONTAINER_NAME}"
            "modules": [
                {
                    "source": string, // default: "${DEFAULT_SOURCE}",
                    "dist": string, // default: "${DEFAULT_DIST_PREFIX}",
                    "targetDir": string // default: derived from the "source" directory's path's last part, e.g. dspl-website
                },
                {
                    //...
                }
            ]
        }
    `);
}

/**
 * Tears down the environment when the script is stopped
 *
 * @param {Config} config configuration object
 */
async function handleExit(config) {
    if (config.docker) {
        await unregisterSidecar(config.dockerContainerName);
    } else {
        console.log('\n=== Stopping sync with WS instance... ===');
        await stopFsSync();
    }
    stopDistWatcher();
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
    ['SIGINT'].forEach((event) => {
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
            config.modules.forEach((module) => startWatch(module.source));

            startDistWatcher(config.modules);
        } else {
            console.log('=== Setting up the the server... ===');
            await setup();

            console.log('=== Starting sync with WS instance... ===');
            await startFsSync(false);

            console.log('=== Starting code changes watch... ===');
            config.modules.forEach((module) =>
                startWatch(module.source, false)
            );

            startDistWatcher(config.modules);
        }
    } catch (err) {
        console.log(
            '=== Error occurred during sync setup. Please check the logs above for more details. ==='
        );
        await handleExit(config);
    }
}

main();
