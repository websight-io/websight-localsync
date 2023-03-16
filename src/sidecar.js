#!/usr/bin/env node

import {setup} from './setup.js';
import {startFsSync, stopFsSync} from "./sync.js";
async function handleStart() {
    console.log('=== Setting up the the server... ===');
    await setup();

    console.log('=== Starting sync with WS instance... ===');
    await startFsSync();
    console.log('=== Successfully started sync with WS instance. ===');
}

async function handleStop() {
    console.log('=== Stopping sync with WS instance... ===');
    await stopFsSync();
    console.log('=== Successfully stopped sync with WS instance. ===');
}

function logHelpMessage() {
    console.log(`Usage: run with "start" or "stop" argument to start or stop the sync with WS instance.`);
}

async function main() {

    if (process.argv.includes('start')) {
        handleStart();
    } else if (process.argv.includes('stop')) {
        handleStop();
    } else {
        logHelpMessage();
    }
}

main();


