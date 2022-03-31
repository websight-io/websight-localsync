## Description

Tool to seamlessly synchronize local code changes with WebSight instance. 

## Requirements 
- node v.12 or later

## How to use
1. Install package as a dev dependency `npm install -D websight-localsync`
2. Add `watch` script entry in `package.json` e.g.:
```
"scripts": {
    ...
    "watch": "babel src/main/webapp/ --config-file ./babel/.babelrc.js --extensions \".js,.jsx,.ts,.tsx\" -d target/dist --copy-files --watch"
}
```
3. Run script either using `npx websight-localsync` or configure it as a `script` entry in `package.json`:
```
"scripts": {
    ...
    "sync": "websight-localsync"
}
```
4. (Optional) There are possible scenarios where the default options do not meet our need. There are several parameters to modify the default behavior:
- target-folder: folder where the resources that we want to sync can be found. Default: `target/dist/apps/<projectName>`
- provider-root-suffix: the path under `/dev/apps/` where the synced resources will be copied. Default: `<projectName>`

Example: our resources can be found under `dist` folder and inside the JCR repository we want to see them under `/dev/apps/my-site/web_resources`:
```
"scripts": {
    ...
    "sync": "websight-localsync target-folder=dist provider-root-suffix=my-site/web_resources"
}
```
You can use `npx websight-localsync --help` to get help about the usage.

## How to publish
To publish a new package version modify `version` in `package.json` and run `npm publish`.
You need to be logged in to company's npm account. To log in use `npm login`. Reach @Michał Cukierman for credentials.

## How it works
When running, it will add `target/dist` as FileSystem resource (using FsResourceProvider) to WebSight under `/dev/{PROJECT_NAME}` path. 
It will configure WebSight (using JCR resource mapping) in a way that it first resolves `/dev` before `/apps`.

## Troubleshooting
1. You can see dev version of your code even though this script is not running:

Go to `http://localhost:8080/system/console/configMgr` and search for `Apache Sling File System Resource Provider`. See if there are old mappings to your module and delete them.

