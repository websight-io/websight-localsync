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
        const { stdout, stderr } = childProcess;
        if (!silent) {
            stdout.pipe(process.stdout);
            stderr.pipe(process.stderr);
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
