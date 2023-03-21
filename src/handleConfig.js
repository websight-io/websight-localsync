import * as path from 'path';
import {existsSync, readFileSync} from "fs-extra";

const ARG_NO_DOCKER = '--no-docker';
const ARG_CONTAINER_NAME = '--container-name';
const ARG_SOURCE = '--source';
const ARG_DIST = '--dist';
const ARG_TARGET_DIR = '--target-dir';

const DEFAULT_DOCKER = true;
const DEFAULT_CONTAINER_NAME = 'local-compose-cms-1';
const DEFAULT_SOURCE = '.';
const DEFAULT_DIST = 'target/dist/apps';
const DEFAULT_TARGET_DIR = '';

const currentDir = process.cwd();

function getArgValue(argName) {
    const argNameIndex = process.argv.indexOf(argName);
    return argNameIndex >= 0 ? process.argv[argNameIndex + 1] : undefined;
}

function getArguments() {
    const dockerArgs = process.argv.includes(ARG_NO_DOCKER) ? { docker: false } : undefined;
    const dockerContainerName = getArgValue(ARG_CONTAINER_NAME);

    const source = getArgValue(ARG_SOURCE);
    const dist = getArgValue(ARG_DIST);
    const targetDir = getArgValue(ARG_TARGET_DIR);

    const moduleArgs = (source != null || dist != null || targetDir != null)
        ? {
            ...({ source: source ?? DEFAULT_SOURCE }),
            ...({ dist: dist ?? DEFAULT_DIST}),
            ...({ targetDir: targetDir ?? DEFAULT_TARGET_DIR})
        }
        : undefined;

    return {
        ...(dockerArgs ?? {}),
        ...(moduleArgs ? { modules: [moduleArgs] } : {}),
        ...(dockerContainerName ? { dockerContainerName } : {}),
    }
}

function readConfigFile() {
    const configFilePath = path.join(currentDir, '.ws-localsync.json');
    if (existsSync(configFilePath)) {
        const configFile = readFileSync(configFilePath, 'utf8');
        try {
            const fileContent = JSON.parse(configFile);

            return {
                ...fileContent,
                modules: fileContent.modules?.map(module => ({
                    source: module.source ?? DEFAULT_SOURCE,
                    dist: module.dist ?? DEFAULT_DIST,
                    targetDir: module.targetDir ?? DEFAULT_TARGET_DIR,
                })),
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
        dist: DEFAULT_DIST,
        targetDir: DEFAULT_TARGET_DIR,
    }];

    return {
        docker,
        dockerContainerName,
        modules,
    }
}

// TODO test thoroughly
