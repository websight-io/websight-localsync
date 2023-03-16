import {sendRequest} from "./sendRequest.js";
import {stringify} from "qs";

const projectDir = process.cwd();
const projectName = projectDir.split('/').pop();
const defaultDistDirPrefix = 'target/dist/apps';
const defaultDistDir = `${projectDir}/${defaultDistDirPrefix}/${projectName}`;
const providerRootPrefix = '/dev/apps/';
const defaultProviderRootSuffix = projectName;

let id = '';

export async function startFsSync() {
    // TODO support arguments
    // const { distDir, providerRootSuffix } = handleArguments();

    const result = await sendRequest(
        'post',
        'http://localhost:8080/system/console/configMgr/[Temporary%20PID%20replaced%20by%20real%20PID%20upon%20save]',
        stringify({
            apply: 'true',
            factoryPid: 'org.apache.sling.fsprovider.internal.FsResourceProvider',
            action: 'ajaxConfigManager',
            '$location': '',
            'provider.file': '/ws-localsync/content',
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

function handleArguments() {
    let distDir = defaultDistDir;
    let providerRootSuffix = defaultProviderRootSuffix;
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
    return { distDir, providerRootSuffix };
}
