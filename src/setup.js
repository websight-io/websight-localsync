import axios from 'axios';
import { stringify } from 'qs';
import { sendRequest, toFormData } from './sendRequest.js';

async function setupMappings() {
    let result = await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl'
    );

    if (result.status === 200) {
        const props = Object.fromEntries(Object.entries(result.data.properties).map(([key, value]) => ([key, value.value || value.values])));
        if (props['resource.resolver.mapping'].includes('/dev/apps/:/apps/')) {
            console.log('Mapping already configured');
            return;
        }
        props['resource.resolver.mapping'].push('/dev/apps/:/apps/');
        props['resource.resolver.mapping'].push('/apps/:/apps/');

        result = await sendRequest(
            'post',
            'http://localhost:8080/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl',
            stringify({
                apply: 'true',
                action: 'ajaxConfigManager',
                '$location': '',
                ...props,
                'propertylist': Object.keys(props).join(',')
            }, { arrayFormat: 'repeat' })
        );

        if (result.status === 302) {
            console.log('Added mapping');
        }
    }
}

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
    if (await sendRequest(
        'post',
        'http://localhost:8080/system/console/bundles',
        toFormData({
            action: 'install',
            bundlefile: bundleFile.data
        })
    ) != null) {
        console.log('Installed FsResourceProvider');
    }

    if (await sendRequest(
        'post',
        'http://localhost:8080/system/console/bundles/org.apache.sling.fsresource',
        toFormData({
            action: 'start'
        })
    ) != null) {
        console.log('Activated FsResourceProvider');
    }

}

async function setup() {
    return Promise.all([
        setupMappings(),
        setupFsResourceProvider()
    ]);
}

export { setup };
