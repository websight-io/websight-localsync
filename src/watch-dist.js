import { watch } from 'chokidar';
import { copy, mkdir, remove, ensureDirSync } from 'fs-extra';
import { dirname } from 'path';
import { homedir } from 'os';

const PATH_PREFIX = 'target/dist/apps/';
const TARGET_PATH_PREFIX = `${homedir}/.ws-localsync/content`;

let watcher = null;

const getPathWithoutPrefix = path => path.replace(PATH_PREFIX, '');

const getFullSourcePath = path => `${process.cwd()}/${path}`;

// TODO remove hard coded path
export function startDistWatcher() {
    watcher = watch(PATH_PREFIX, {
       persistent: true,
    });

    console.log('=== Starting file watcher ===');

    let isInitialized = false;

    watcher
        .on('ready', () => {
            console.log('=== File watcher initialized. Ready for changes. ===');
            isInitialized = true;
        })
        .on('add', path => {
            const localPath = getPathWithoutPrefix(path);
            const targetPath = `${TARGET_PATH_PREFIX}/${localPath}`;
            ensureDirSync(dirname(targetPath));
            copy(getFullSourcePath(path), targetPath, { overwrite: true, recursive: true })
                .then(() => {
                    console.log(`Added ${localPath} (${targetPath})`)
                })
                .catch(err => {
                    console.error(`Failed to add ${localPath}`, err);
                });
        })
        .on('change', path => {
            const localPath = getPathWithoutPrefix(path);
            const targetPath = `${TARGET_PATH_PREFIX}/${localPath}`;
            ensureDirSync(dirname(targetPath));
            copy(getFullSourcePath(path), targetPath, { overwrite: true, recursive: true })
                .then(() => {
                    console.log(`Updated ${localPath} (${targetPath})`)
                })
                .catch(err => {
                    console.error(`Failed to update ${localPath}`, err);
                });
        })
        .on('unlink', path => {
            const localPath = getPathWithoutPrefix(path);
            const targetPath = `${TARGET_PATH_PREFIX}/${localPath}`;
            remove(targetPath)
                .then(() => {
                    console.log(`Removed ${localPath} (${targetPath})`);
                })
                .catch(err => {
                    console.error(`Failed to remove ${localPath}`, err);
                });
        })
        .on('addDir', path => {
            const localPath = getPathWithoutPrefix(path);
            const targetPath = `${TARGET_PATH_PREFIX}/${localPath}`;
            ensureDirSync(dirname(targetPath));
            mkdir(targetPath)
                .then(() => {
                    console.log(`Created directory ${localPath} (${targetPath})`);
                })
                .catch(err => {
                    console.error(`Failed to create directory ${localPath}`, err);
                });
        })
        .on('unlinkDir', path => {
            const localPath = getPathWithoutPrefix(path);
            const targetPath = `${TARGET_PATH_PREFIX}/${localPath}`;
            remove(targetPath)
                .then(() => {
                    console.log(`Removed ${localPath} (${targetPath})`);
                })
                .catch(err => {
                    console.error(`Failed to remove ${localPath}`, err);
                });
        });
}

export function stopDistWatcher() {
    if (watcher != null) {
        watcher.close()
            .then(() => console.log('=== Stopped file watcher ==='));
    } else {
        console.log('=== Failed to stop. Watcher is not started yet. ===')
    }
}
