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

import { exec } from 'child_process';

/**
 * @type {*[]} list of child processes that were started by the script
 */
const runningProcesses = [];

/**
 * @param {string} cmd command to execute in the shell of the child process
 * @param {boolean} silent if true, the outputs (std, err) of the child process will not be piped to the parent process
 * @returns {Promise<unknown>} promise that resolves when the child process starts and rejects when the child process exits with an error
 */
function execPromise(cmd, silent = false) {
    return new Promise((resolve, reject) => {
        const childProcess = exec(cmd, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
        runningProcesses.push(childProcess);
        const { stdin, stdout, stderr } = childProcess;
        if (!silent) {
            stdout.pipe(process.stdout);
            stderr.pipe(process.stderr);
            process.stdin.pipe(stdin);
        }
    });
}

/**
 * Kills all child processes that were started by the script.
 */
function stopChildProcesses() {
    if (runningProcesses.length > 0) {
        console.log(
            `=== Stopping ${runningProcesses.length} background processes... ===`
        );
        runningProcesses.forEach((childProcess) => {
            childProcess.kill('SIGINT');
        });
    }
}

export { execPromise, stopChildProcesses };
