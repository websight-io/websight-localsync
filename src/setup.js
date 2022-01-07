const qs = require('qs');
const fs = require('fs');
const axios = require('axios');
const { sendRequest, toFormData } = require('./sendRequest.js');

async function setupMappings() {
    const result1 = await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl'
    );

    if (result1.status === 200) {
        const props = Object.fromEntries(Object.entries(result1.data.properties).map(([key, value]) => ([key, value.value || value.values])));
        if (props['resource.resolver.mapping'].includes('/dev/apps/:/apps/')) {
            console.log('Mapping already configured');
            return;
        }
        props['resource.resolver.mapping'].push('/dev/apps/:/apps/');
        props['resource.resolver.mapping'].push('/apps/:/apps/');

        const result2 = await sendRequest(
            'post',
            'http://localhost:8080/system/console/configMgr/org.apache.sling.jcr.resource.internal.JcrResourceResolverFactoryImpl',
            qs.stringify({
                apply: 'true',
                action: 'ajaxConfigManager',
                '$location': '',
                ...props,
                'propertylist': Object.keys(props).join(',')
            }, { arrayFormat: 'repeat' })
        );

        if (result2.status === 302) {
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

module.exports = { setup };
