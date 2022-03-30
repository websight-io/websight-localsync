#!/usr/bin/env node

const { exec } = require('child_process');
const qs = require('qs');

const projectDir = process.cwd();
const projectName = projectDir.split('/').pop();
let distDir = `${projectDir}/target/dist/apps/${projectName}`;
let providerRootSuffix = projectName;
const { setup } = require('./setup.js');
const { sendRequest, toFormData } = require('./sendRequest.js');

let id = '';

async function startFsSync() {
    const result = await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/[Temporary%20PID%20replaced%20by%20real%20PID%20upon%20save]',
        qs.stringify({
            apply: 'true',
            factoryPid: 'org.apache.sling.fsprovider.internal.FsResourceProvider',
            action: 'ajaxConfigManager',
            '$location': '',
            'provider.file': distDir,
            'provider.root': `/dev/apps/${providerRootSuffix}`,
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

async function stopFsSync() {
    const result = await sendRequest(
        'post',
        `http://localhost:8080/system/console/configMgr/org.apache.sling.fsprovider.internal.FsResourceProvider.${id}`,
        qs.stringify({
            apply: 'true',
            delete: 'true'
        })
    );
    if (result != null) {
        console.log(`Deleted configuration with id: ${id} from FsResourceProvider`);
    }
}

function startWatch() {
    const watch = exec('npm run watch');
    watch.stdout.pipe(process.stdout);
    watch.stderr.pipe(process.stderr);
}

function handleArguments() {
    process.argv.forEach((val) => {
        if(val.startsWith('target-folder')) {
            const targetFolderFromArgs = val.split('=')[1];
            if (targetFolderFromArgs != null) {
                distDir = `${projectDir}/${targetFolderFromArgs}`;
            }
        }
        if(val.startsWith('provider-root-suffix')) {
            const suffixFromArgs = val.split('=')[1];
            if (suffixFromArgs != null) {
                providerRootSuffix = suffixFromArgs;
            }
        }
    });
}

async function main() {
    let handlingExit = false;
    ['SIGINT'].forEach(event => {
        process.on(event, () => {
            if (!handlingExit) {
                handlingExit = true;
                console.log('\n=== Stopping sync with WS instance... ===');
                stopFsSync();
            }
        });
    });

    console.log('=== Setting up the the server... ===');
    await setup();

    handleArguments();

    console.log('=== Starting sync with WS instance... ===');
    await startFsSync();

    console.log('=== Starting code changes watch... ===');
    await startWatch();
}

main();


