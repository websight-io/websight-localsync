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
