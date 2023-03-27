import {sendRequest} from "./send-request.js";
import {stringify} from "qs";
import {emptyDirSync} from "fs-extra";

import { join } from 'path';
import { homedir } from "os";

let id = '';

/**
 * Starts the FsResourceProvider
 *
 * @param {boolean} isInDockerContainer whether the application is running in a docker container
 * @returns {Promise<void>} promise that resolves when the FsResourceProvider is started
 */
export async function startFsSync(isInDockerContainer = true) {
    const result = await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/[Temporary%20PID%20replaced%20by%20real%20PID%20upon%20save]',
        stringify({
            apply: 'true',
            factoryPid: 'org.apache.sling.fsprovider.internal.FsResourceProvider',
            action: 'ajaxConfigManager',
            '$location': '',
            'provider.file': isInDockerContainer ? '/ws-localsync/content' : '~/.ws-localsync/content',
            'provider.root': '/dev/apps',
            'provider.fs.mode': 'FILES_FOLDERS',
            'provider.initial.content.import.options': '',
            'provider.filevault.filterxml.path': '',
            'provider.checkinterval': '1000',
            'provider.cache.size': '10000',
            'propertylist': 'provider.file,provider.root,provider.fs.mode,provider.initial.content.import.options,provider.filevault.filterxml.path,provider.checkinterval,provider.cache.size'
        })
    );
    if (result != null) {
        id = result.headers['location'].split('.').pop();
        console.log(`Added configuration with id: ${id} to FsResourceProvider`);
    }
}

/**
 * Stops the FsResourceProvider
 *
 * @returns {Promise<void>} promise that resolves when the FsResourceProvider is stopped
 */
export async function stopFsSync() {
    const result = await sendRequest(
        'post',
        `http://localhost:8080/system/console/configMgr/org.apache.sling.fsprovider.internal.FsResourceProvider.${id}`,
        stringify({
            apply: 'true',
            delete: 'true'
        })
    );
    if (result != null) {
        console.log(`Deleted configuration with id: ${id} from FsResourceProvider`);
    }
}

/**
 * Clears the sync directory on the local machine
 */
export function clearFSSyncDirectory() {
    console.log(`=== Clearing sync directory... ===`);
    emptyDirSync(join(homedir(), '/.ws-localsync/content'));
    console.log(`=== Cleared sync directory successfully ===`);
}
