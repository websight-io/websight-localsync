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

import { stringify } from 'qs';
import { emptyDirSync } from 'fs-extra';
import { join } from 'path';
import { homedir } from 'os';

import { sendRequest } from './send-request';

const findAllCDataBlocks = (str) => {
    const blocks = [];
    let index = str.indexOf('<![CDATA[');
    while (index !== -1) {
        const end = str.indexOf(']]>', index);
        blocks.push(str.substring(index + 9, end));
        index = str.indexOf('<![CDATA[', end);
    }
    return blocks;
};

/**
 * Gets the id of the FsResourceProviders
 *
 * @returns {Promise<Array<string>>}
 */
const getFsResourceProviderId = async () => {
    console.log('=== Trying to get FsResourceProvider id ===');

    const res = await sendRequest(
        'get',
        'http://localhost:8080/system/console/configMgr'
    );

    const dataBlocks = findAllCDataBlocks(res.data);

    const configData = dataBlocks
        .map((dataBlock) =>
            // eslint-disable-next-line no-new-func
            new Function(`
            try {
                ${dataBlock}
                return configData != null ? configData : null;
            } catch (e) {
                return null;
            } 
        `)()
        )
        .filter(
            (dataBlockOutput) =>
                dataBlockOutput != null && dataBlockOutput.pids != null
        )[0];

    if (configData != null) {
        const fsResourceProviderPids = configData.pids.filter(
            (pid) =>
                pid.id?.startsWith(
                    'org.apache.sling.fsprovider.internal.FsResourceProvider'
                ) && pid.nameHint?.includes('/dev/apps')
        );

        return fsResourceProviderPids.map((pid) => pid.id.split('.').pop());
    }

    console.log('=== Failed to get FsResourceProvider id ===');
    return null;
};

/**
 * Starts the FsResourceProvider
 *
 * @param {boolean} isInDockerContainer whether the application is running in a docker container
 * @returns {Promise<void>} promise that resolves when the FsResourceProvider is started
 */
export const startFsSync = async (isInDockerContainer = true) => {
    const sourceDir = isInDockerContainer
        ? '/ws-localsync/content'
        : join(homedir(), '/.ws-localsync/content');
    console.log(`=== Starting FsResourceProvider for ${sourceDir} ===`);

    await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/[Temporary%20PID%20replaced%20by%20real%20PID%20upon%20save]',
        stringify({
            apply: 'true',
            factoryPid:
                'org.apache.sling.fsprovider.internal.FsResourceProvider',
            action: 'ajaxConfigManager',
            $location: '',
            'provider.file': sourceDir,
            'provider.root': '/dev/apps',
            'provider.fs.mode': 'FILES_FOLDERS',
            'provider.initial.content.import.options': '',
            'provider.filevault.filterxml.path': '',
            'provider.checkinterval': '1000',
            'provider.cache.size': '10000',
            propertylist:
                'provider.file,provider.root,provider.fs.mode,provider.initial.content.import.options,provider.filevault.filterxml.path,provider.checkinterval,provider.cache.size',
        })
    );
};

/**
 * Stops the FsResourceProvider
 *
 * @returns {Promise<void>} promise that resolves when the FsResourceProvider is stopped
 */
export const stopFsSync = async () => {
    const ids = await getFsResourceProviderId();

    const result = await Promise.all(
        ids.map((id) =>
            sendRequest(
                'post',
                `http://localhost:8080/system/console/configMgr/org.apache.sling.fsprovider.internal.FsResourceProvider.${id}`,
                stringify({
                    apply: 'true',
                    delete: 'true',
                })
            )
        )
    );
    if (result != null) {
        console.log(
            `=== Deleted configuration with ids: ${ids.join(
                ','
            )} from FsResourceProvider ===`
        );
    }
};

/**
 * Clears the sync directory on the local machine
 */
export const clearFSSyncDirectory = () => {
    console.log(`=== Clearing sync directory... ===`);
    emptyDirSync(join(homedir(), '/.ws-localsync/content'));
    console.log(`=== Cleared sync directory successfully ===`);
};
