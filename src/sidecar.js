/*
 * Copyright (C) 2023 Dynamic Solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import setup from './setup';
import { startFsSync, stopFsSync } from './sync';

/**
 * Starts the sync with the WS instance within the current container.
 *
 * @returns {Promise<void>} promise that resolves when the sync is started
 */
async function handleStart() {
    console.log('=== Setting up the the server... ===');
    await setup();

    console.log('=== Starting sync with WS instance... ===');
    await startFsSync();
    console.log('=== Successfully started sync with WS instance. ===');
}

/**
 * Stops the sync with the WS instance within the current container.
 *
 * @returns {Promise<void>} promise that resolves when the sync is stopped
 */
async function handleStop() {
    console.log('=== Stopping sync with WS instance... ===');
    await stopFsSync();
    console.log('=== Successfully stopped sync with WS instance. ===');
}

/**
 * Logs the help message.
 */
function logHelpMessage() {
    console.log(
        `Usage: run with "start" or "stop" argument to start or stop the sync with WS instance.`
    );
}

/**
 * Starts and stops the sync with the WS instance within the current container based on the arguments passed to the script.
 *
 * @returns {Promise<void>} promise that resolves when the script is finished
 */
async function main() {
    if (process.argv.includes('start')) {
        await handleStart();
    } else if (process.argv.includes('stop')) {
        await handleStop();
    } else {
        logHelpMessage();
    }
}

main();
