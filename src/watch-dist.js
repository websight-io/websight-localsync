import { watch } from 'chokidar';
import { copy, ensureDir, ensureDirSync, remove } from 'fs-extra';
import { dirname, join } from 'path';
import { homedir } from 'os';

const TARGET_PATH_PREFIX = `${homedir}/.ws-localsync/content`;

let watcher = null;

/**
 * Removes the prefix from the path
 *
 * @param {string} path the path of the file
 * @param {string} prefix the prefix to remove
 * @returns {string} path without prefix
 */
const getPathWithoutPrefix = (path, prefix) => path.replace(prefix, '');

/**
 * Generates the target path for the given path
 *
 * @param {string} path the path where the file was changed
 * @param {Array<Config>} modules the modules to where the file watcher is watching
 * @returns {string} the target path
 */
const getTargetPath = (path, modules) => {
    const specificModule = modules.find((module) =>
        path.startsWith(module.watchDir)
    );
    return join(
        TARGET_PATH_PREFIX,
        specificModule.targetDir,
        getPathWithoutPrefix(path, specificModule.watchDir)
    );
};

/**
 * Returns the directory where the file watcher should watch for changes
 *
 * @param {Config} module the module config
 * @returns {string} the directory where the file watcher should watch for changes
 */
const getModuleWatchDir = (module) =>
    join(process.cwd(), module.source, module.dist);

/**
 * Starts the file watcher for the given modules
 *
 * @param {Array<Module>} modules the modules to start the file watcher for
 */
export function startDistWatcher(modules) {
    const modulesWithWatchDirs = modules.map((module) => ({
        ...module,
        watchDir: getModuleWatchDir(module),
    }));
    watcher = watch(
        modulesWithWatchDirs.map((module) => module.watchDir),
        {
            persistent: true,
        }
    );

    console.log('=== Starting file watcher ===');

    watcher
        .on('ready', () => {
            console.log('=== File watcher initialized. Ready for changes. ===');
        })
        .on('add', (path) => {
            const targetPath = getTargetPath(path, modulesWithWatchDirs);
            ensureDirSync(dirname(targetPath));
            copy(path, targetPath, { overwrite: true, recursive: true })
                .then(() => {
                    console.log(`Added ${targetPath}`);
                })
                .catch((err) => {
                    console.error(`Failed to add ${targetPath}`, err);
                });
        })
        .on('change', (path) => {
            const targetPath = getTargetPath(path, modulesWithWatchDirs);
            ensureDirSync(dirname(targetPath));
            copy(path, targetPath, { overwrite: true, recursive: true })
                .then(() => {
                    console.log(`Updated ${targetPath}`);
                })
                .catch((err) => {
                    console.error(`Failed to update ${targetPath}`, err);
                });
        })
        .on('unlink', (path) => {
            const targetPath = getTargetPath(path, modulesWithWatchDirs);
            remove(targetPath)
                .then(() => {
                    console.log(`Removed ${targetPath}`);
                })
                .catch((err) => {
                    console.error(`Failed to remove ${targetPath}`, err);
                });
        })
        .on('addDir', (path) => {
            const targetPath = getTargetPath(path, modulesWithWatchDirs);
            ensureDir(targetPath)
                .then(() => {
                    console.log(`Created directory ${targetPath}`);
                })
                .catch((err) => {
                    console.error(
                        `Failed to create directory ${targetPath}`,
                        err
                    );
                });
        })
        .on('unlinkDir', (path) => {
            const targetPath = getTargetPath(path, modulesWithWatchDirs);
            remove(targetPath)
                .then(() => {
                    console.log(`Removed ${targetPath}`);
                })
                .catch((err) => {
                    console.error(`Failed to remove ${targetPath}`, err);
                });
        });
}

/**
 * Stops the file watcher
 */
export function stopDistWatcher() {
    if (watcher != null) {
        watcher.close().then(() => console.log('=== Stopped file watcher ==='));
    } else {
        console.log('=== Failed to stop. Watcher is not started yet. ===');
    }
}
