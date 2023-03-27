import { join } from 'path';
import {existsSync, readFileSync} from "fs-extra";

const ARG_NO_DOCKER = '--no-docker';
const ARG_CONTAINER_NAME = '--container-name';
const ARG_SOURCE = '--source';
const ARG_DIST = '--dist';
const ARG_TARGET_DIR = '--target-dir';

const DEFAULT_DOCKER = true;
const DEFAULT_CONTAINER_NAME = 'local-compose-cms-1';
const DEFAULT_SOURCE = '.';
const DEFAULT_DIST_PREFIX = 'target/dist/apps';

const currentDir = process.cwd();

function getModuleName(source) {
    return source?.includes('/') ? source.split('/').pop() : currentDir.split('/').pop();
}

function getModuleArgs(sourceValue, distValue, targetDirValue) {
    if (sourceValue != null || distValue != null || targetDirValue != null) {
        const moduleName = getModuleName(sourceValue);

        const source = sourceValue ?? DEFAULT_SOURCE;
        const dist = distValue ?? join(DEFAULT_DIST_PREFIX, moduleName);
        const targetDir = targetDirValue ?? moduleName;

        return { source, dist, targetDir };
    } else {
        return undefined;
    }
}

function getArgValue(argName) {
    const argNameIndex = process.argv.indexOf(argName);
    return argNameIndex >= 0 ? process.argv[argNameIndex + 1] : undefined;
}

function getArguments() {
    const dockerArgs = process.argv.includes(ARG_NO_DOCKER) ? { docker: false } : undefined;
    const dockerContainerName = getArgValue(ARG_CONTAINER_NAME);

    const moduleArgs = getModuleArgs(
        getArgValue(ARG_SOURCE),
        getArgValue(ARG_DIST),
        getArgValue(ARG_TARGET_DIR)
    );

    return {
        ...(dockerArgs ?? {}),
        ...(moduleArgs ? { modules: [moduleArgs] } : {}),
        ...(dockerContainerName ? { dockerContainerName } : {}),
    }
}

function readConfigFile() {
    const configFilePath = join(currentDir, '.ws-localsync.json');
    if (existsSync(configFilePath)) {
        const configFile = readFileSync(configFilePath, 'utf8');
        try {
            const fileContent = JSON.parse(configFile);

            return {
                ...fileContent,
                modules: fileContent.modules?.map(module => {
                    const source = module.source ?? DEFAULT_SOURCE;
                    const moduleName = getModuleName(source);

                    return ({
                        source,
                        dist: module.dist ?? join(DEFAULT_DIST_PREFIX, moduleName),
                        targetDir: module.targetDir ?? moduleName,
                    });
                }),
            }
        } catch (e) {
            console.error(`=== Error while parsing config file, please make sure it's a valid JSON. ===`);
            return null;
        }
    } else {
        console.log('=== No config file found, skipping... ===');
        return null;
    }
}

/**
 * Returns a config object with the following properties:
 * - docker: boolean - whether WebSight CMS is running in Docker or not
 * - dockerContainerName: string - name of the Docker container running WebSight CMS
 * - modules: [] - list of modules to sync
 * - - source: string - path to the module's root directory
 * - - dist: string - path to the module's dist directory (relative to the module's root directory)
 * - - targetDir: string - path to the module's target directory (within `/dev/apps`)
 */
export function getConfig() {
    const fileConfig = readConfigFile();

    const argsConfig = getArguments();

    const docker = argsConfig.docker ?? fileConfig?.docker ?? DEFAULT_DOCKER;
    const dockerContainerName = argsConfig.dockerContainerName ?? fileConfig?.dockerContainerName ?? DEFAULT_CONTAINER_NAME;
    const modules = argsConfig.modules ?? fileConfig?.modules ?? [{
        source: DEFAULT_SOURCE,
        dist: DEFAULT_DIST_PREFIX,
        targetDir: getModuleName(DEFAULT_SOURCE),
    }];

    return {
        docker,
        dockerContainerName,
        modules,
    }
}

// TODO test thoroughly (config file, args, etc. - config file in ds.pl - args overriding config file)
