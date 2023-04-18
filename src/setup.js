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

import axios from 'axios';
import { stringify } from 'qs';

import { sendRequest, toFormData } from './send-request';

/**
 * Setup of the directory mappings from /dev/apps to /apps
 *
 * @returns {Promise<void>} promise that resolves when the mappings are set up
 */
async function setupMappings() {
    let result = await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl'
    );

    if (result.status === 200) {
        const props = Object.fromEntries(
            Object.entries(result.data.properties).map(([key, value]) => [
                key,
                value.value || value.values,
            ])
        );
        if (props['resource.resolver.mapping'].includes('/dev/apps/:/apps/')) {
            console.log('Mapping already configured');
            return;
        }
        props['resource.resolver.mapping'].push('/dev/apps/:/apps/');
        props['resource.resolver.mapping'].push('/apps/:/apps/');

        result = await sendRequest(
            'post',
            'http://localhost:8080/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl',
            stringify(
                {
                    apply: 'true',
                    action: 'ajaxConfigManager',
                    $location: '',
                    ...props,
                    propertylist: Object.keys(props).join(','),
                },
                { arrayFormat: 'repeat' }
            )
        );

        if (result.status === 302) {
            console.log('Added mapping');
        }
    }
}

/**
 * Setup of the FsResourceProvider
 *
 * @returns {Promise<void>} promise that resolves when the FsResourceProvider is set up
 */
async function setupFsResourceProvider() {
    const response = await sendRequest(
        'post',
        'http://localhost:8080/system/console/bundles/org.apache.sling.fsresource'
    );
    if (response.status === 200) {
        console.log('Detected FsResourceProvider.');
        return;
    }

    const bundleFile = await axios.get(
        'https://repo1.maven.org/maven2/org/apache/sling/org.apache.sling.fsresource/2.2.0/org.apache.sling.fsresource-2.2.0.jar',
        { responseType: 'stream' }
    );
    if (
        (await sendRequest(
            'post',
            'http://localhost:8080/system/console/bundles',
            toFormData({
                action: 'install',
                bundlefile: bundleFile.data,
            })
        )) != null
    ) {
        console.log('Installed FsResourceProvider');
    }

    if (
        (await sendRequest(
            'post',
            'http://localhost:8080/system/console/bundles/org.apache.sling.fsresource',
            toFormData({
                action: 'start',
            })
        )) != null
    ) {
        console.log('Activated FsResourceProvider');
    }
}

/**
 * Setup of the file mappings and the FsResourceProvider
 *
 * @returns {Promise<Awaited<void>[]>} promise that resolves when the mappings and the FsResourceProvider are set up
 */
export default async function setup() {
    return Promise.all([setupMappings(), setupFsResourceProvider()]);
}
