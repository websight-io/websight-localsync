## Description

Tool to seamlessly synchronize local code changes with WebSight instance. 

## How to use
This package is deployed as to Github Package Registry. In order to use it:
1. Add `.npmrc` file in your project root with following content:
```
@DS-WebSight:registry=https://npm.pkg.github.com
```
2. Install package as a dev dependency `npm install -D @DS-WebSight/websight-localsync`
3. Add `watch` script entry in `package.json` e.g.:
```
"scripts": {
    ...
    "watch": "babel src/main/webapp/ --config-file ./babel/.babelrc.js --extensions \".ts,.tsx\" -d target/dist --copy-files --watch"
}
```
4. Run script either using `npx websight-localsync` or configure it as a `script` entry in `package.json`:
```
"scripts": {
    ...
    "sync": "websight-localsync"
}
```

## How to publish
To publish a new package version modify `version` in `package.json` and run `npm publish`.

## How it works
When running, it will add `target/dist` as FileSystem resource (using FsResourceProvider) to WebSight under `/dev/{PROJECT_NAME}` path. 
It will configure WebSight (using JCR resource mapping) in a way that it first resolves `/dev` before `/apps`.

