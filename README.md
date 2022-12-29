## Description

A tool to seamlessly synchronize local code changes with your WebSight instance.

## Requirements

- Node 16.x (the active LTS)

## How to use
Configure the project you are actively working on:

- install `websight-localsync` as module dev dependency:
  - use the latest [released version](https://www.npmjs.com/package/websight-localsync):
    ```bash
    npm install websight-localsync --save-dev
    ```
- add `watch` script entry in `package.json` e.g.:
  ```yaml
  "scripts": {
    ...
    "watch": "babel src/main/webapp/ --config-file ./babel/.babelrc.js --extensions \".js,.jsx,.ts,.tsx\" -d target/dist --copy-files --watch"
  }
  ```
- run script either using `npx websight-localsync [option...]` or configure it as a `script` entry in `package.json`:
  ```yaml
  "scripts": {
    ...
    "sync": "websight-localsync [option...]"
  }
  ```
  - Options:
    - **target-folder**: folder where the resources that we want to sync can be found. *Default*: `${defaultDistDirPrefix}/ + the name of the project`
    - **provider-root-suffix**: the path under ${providerRootPrefix} where the synced resources will be copied. *Default*: `the name of the project`
  - Example: `websight-localsync target-folder=dist provider-root-suffix=my-site/web_resources`
  
### Using with docker
The tool is working with filesystem so we need to make sure the files of the project you're working on are available inside of the Docker container.
  - configure an additional volume pointing your `projects` root folder using the local driver by adding:
    ```yaml
    volumes:
      ...
      localsync:
        driver: local
        driver_opts:
          o: bind
          device: ${PWD}/../../../
          type: none
    ```
  - point the new volume in the ICE container
    ```yaml
    services:
      ice:
        ...
        volumes:
          ...
          - localsync:${PWD}/../../../:ro 
    ```
- bind your `projects` root folder into Docker containers (`Docker Desktop` -> `Preferences` -> `File Sharing` -> add the new entry)

## How it works

Once we run `npx websight-localsync`

```bash
npx websight-localsync                                                                                                              ✔ ╱ 15:25:56
=== Setting up the the server... ===
Detected FsResourceProvider.
Added mapping
=== Starting sync with WS instance... ===
Added configuration with id: http://localhost:8080/system/console/configMgr/[Temporary PID replaced by real PID upon save] to FsResourceProvider
=== Starting code changes watch... ===

> watch
> babel src/main/webapp/ --config-file ./babel/.babelrc.js --extensions ".js,.jsx,.ts,.tsx" -d target/dist --copy-files --watch

Successfully compiled 33 files with Babel.
```

it connects to `localhost:8080` and add the `Apache Sling File System Resource Provider` configuration to map the JCR path (under `/dev/{PROJECT_NAME}`) 
to the local filesystem (basically `target/dist`).

In [localhost:8080/system/console/configMgr](http://localhost:8080/system/console/configMgr) you can check the configuration:

![OSGI Configuration Manager](./docs/images/configMgr-fsresource.png)

and check details

![Apache Sling File System Resource Provider configuration](./docs/images/configMgr-fsresource-config.png)

It also configures the environment (using JCR resource mapping) in a way that it first resolves `/dev` before `/apps`.

### How to build
Run commands
```bash
npm install
```
to build the app.

### How to test during development
In some example project you want to use for testing:
- add to the `package.json`:
  ```json
  {
    "devDependencies": {
      "websight-localsync": "file:../../websight-localsync"
    }
  }
  ```


## How to publish

To publish a new package version modify `version` in `package.json` and run `npm publish`.
You need to be logged in to company's npm account. To log in use `npm login`. Reach @Michał Cukierman for credentials.

## Troubleshooting

### The dev files are not synchronised
Verify that the `Apache Sling File System Resource Provider (org.apache.sling.fsresource)` bundle is Active in http://localhost:8080/system/console/bundles/org.apache.sling.fsresource.
- if Status is `Resolved` you can activate the bundle

### You can see dev version of your code even though this script is not running

Go to `http://localhost:8080/system/console/configMgr` and search for `Apache Sling File System Resource Provider`. See if there are old mappings to your module and delete them.

