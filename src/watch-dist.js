import { watch } from 'chokidar';
import { copy, mkdir, remove, ensureDir, ensureDirSync } from 'fs-extra';
import { dirname, join } from 'path';
import { homedir } from 'os';

const TARGET_PATH_PREFIX = `${homedir}/.ws-localsync/content`;

let watcher = null;

const getPathWithoutPrefix = (path, prefix) => path.replace(prefix, '');

const getTargetPath = (path, modules) => {
    const specificModuleDir = modules.find(moduleDir => path.startsWith(moduleDir));
    return join(TARGET_PATH_PREFIX, getPathWithoutPrefix(path, specificModuleDir));
}

const getModuleWatchDir = (module) => join(process.cwd(), module.source, module.dist);

// TODO remove hard coded path
export function startDistWatcher(modules) {
    const moduleDirs = modules.map(getModuleWatchDir);
    watcher = watch(moduleDirs, {
       persistent: true,
    });

    console.log('module dirs', moduleDirs)
    console.log('=== Starting file watcher ===');

    let isInitialized = false;

    watcher
        .on('ready', () => {
            console.log('=== File watcher initialized. Ready for changes. ===');
            isInitialized = true;
        })
        .on('add', path => {
            const targetPath = getTargetPath(path, moduleDirs);
            ensureDirSync(dirname(targetPath));
            copy(path, targetPath, { overwrite: true, recursive: true })
                .then(() => {
                    console.log(`Added ${targetPath}`)
                })
                .catch(err => {
                    console.error(`Failed to add ${targetPath}`, err);
                });
        })
        .on('change', path => {
            const targetPath = getTargetPath(path, moduleDirs);
            ensureDirSync(dirname(targetPath));
            copy(path, targetPath, { overwrite: true, recursive: true })
                .then(() => {
                    console.log(`Updated ${targetPath}`)
                })
                .catch(err => {
                    console.error(`Failed to update ${targetPath}`, err);
                });
        })
        .on('unlink', path => {
            const targetPath = getTargetPath(path, moduleDirs);
            remove(targetPath)
                .then(() => {
                    console.log(`Removed ${targetPath}`);
                })
                .catch(err => {
                    console.error(`Failed to remove ${targetPath}`, err);
                });
        })
        .on('addDir', path => {
            const targetPath = getTargetPath(path, moduleDirs);
            ensureDir(targetPath)
                .then(() => {
                    console.log(`Created directory ${targetPath}`);
                })
                .catch(err => {
                    console.error(`Failed to create directory ${targetPath}`, err);
                });
        })
        .on('unlinkDir', path => {
            const targetPath = getTargetPath(path, moduleDirs);
            remove(targetPath)
                .then(() => {
                    console.log(`Removed ${targetPath}`);
                })
                .catch(err => {
                    console.error(`Failed to remove ${targetPath}`, err);
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
