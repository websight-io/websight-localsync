## Description

A tool to seamlessly synchronize local code changes with your WebSight instance.

Demonstration video: https://drive.google.com/file/d/1wMU8_q2_rUOEN-9_g27QxNhg_4En09AS/view?usp=sharing
Example full integration: https://bitbucket.org/teamds-workspace/www.ds.pl-websight/pull-requests/30

## Requirements

- Node 18.x (the active LTS)

## Using with different CMS setup types

### Single module, CMS running as a Docker container
If you're running your CMS as a Docker container you need to mount a new volume to the container with the following configuration:
```yaml
volumes:
  - ~/.ws-localsync:/ws-localsync
```

#### Using command line arguments (Recommended)
```bash
websight-localsync --container-name <container-name>
```

If your build process uses a different folder than `target/dist` you can specify the details the following way:
```bash
websight-localsync --container-name <container-name> --source <source> --dist <dist> --target-dir <target-dir>
```

#### Using config file
Create a file in the current directory called `.ws-localsync.json` with the following content:
```json
{
  "containerName": "<container-name>"
}
```

If your build process uses a different folder than `target/dist` you can specify the details the following way:
```json
{
  "containerName": "<container-name>",
  "modules": [
    {
      "source": "<source>",
      "dist": "<dist>",
      "targetDir": "<target-dir>"
    }
  ]
}
```

### Single module, CMS running on localhost (using jar file)

#### Using command line arguments (Recommended)
```bash
websight-localsync --no-docker
```

If your build process uses a different folder than `target/dist` you can specify the details the following way:
```bash
websight-localsync --no-docker --source <source> --dist <dist> --target-dir <target-dir>
```

#### Using config file
Create a file in the current directory called `.ws-localsync.json` with the following content:
```json
{
  "docker": false
}
```

If your build process uses a different folder than `target/dist` you can specify the details the following way:
```json
{
  "docker": false,
  "source": "<source>",
  "dist": "<dist>",
  "targetDir": "<target-dir>"
}
```

### Multiple modules, CMS running as a Docker container

#### Using config file
If you're running your CMS as a Docker container you need to mount a new volume to the container with the following configuration:
```yaml
volumes:
  - ~/.ws-localsync:/ws-localsync
```

Create a file in the current directory called `.ws-localsync.json` with the following content:
```json
{
  "containerName": "<container-name>",
  "modules": [
    {
      "source": "<source-1>",
      "dist": "<dist-1>",
      "targetDir": "<target-dir-1>"
    },
    {
      "source": "<source-2>",
      "dist": "<dist-2>",
      "targetDir": "<target-dir-2>"
    }
  ]
}
```

#### Using command line arguments
Multiple modules are not supported in case of multiple modules. Please describe your modules in the config file.

### Multiple modules, CMS running on localhost (using jar file)

#### Using config file
Create a file in the current directory called `.ws-localsync.json` with the following content:
```json
{
  "docker": false,
  "modules": [
    {
      "source": "<source-1>",
      "dist": "<dist-1>",
      "targetDir": "<target-dir-1>"
    },
    {
      "source": "<source-2>",
      "dist": "<dist-2>",
      "targetDir": "<target-dir-2>"
    }
  ]
}
```

#### Using command line arguments
Multiple modules are not supported in case of multiple modules. Please describe your modules in the config file.

## How it works

### File sync
The sync mechanism depends on [Apache Sling File System Resource Provider](https://github.com/apache/sling-org-apache-sling-fsresource).
It allows to mount a local folder as a resource provider in the WebSight instance. In Docker setup, the folder is mounted as a volume to `/ws-localsync`,
otherwise the folder `~/.ws-localsync` is used directly for synchronization.
Project file changes need to be handled on the project level, `localsync` uses the project's `watch` script to start building the project.
The `watch` script is responsible for keeping the `dist` directory up to date with the latest changes, `localsync` will then copy the contents
of the `dist` directory to common one (which is the one mounted as volume in case of Docker).

### Support for Docker
The tool supports both Docker and non-Docker setups. In case of Docker, the tool requires additional setup when running the container to mount a volume.
This is because of the way FSResource Provider works, it requires direct file system access to the folder to be used as a resource provider.

### Multiple modules
Multiple modules are supported by started the `watch` script for each module. Then `localsync`'s file watcher will
copy the contents of the `dist` directories to `~/.ws-localsync` according to the directory structure of the modules.

## Command line options
The following command line options are available when running the tool: 
* `--no-docker`: CMS is not running in a Docker container (Default: true)
* `--container-name`: name of the Docker container where the CMS is running (Default: "local-compose-cms-1")
* `--source`: path to the source directory of the module/project to sync (Default: ".")
* `--dist`: path to the dist directory of the module/project to sync (under the "source" directory) (Default: "target/dist/apps")
* `--target-dir`: path to the directory where the synced files should be provided (Default: derived from the "source" directory's path's last part, e.g. dspl-website)

These options take precedence over the ones specified in the config file.

## Configuration file
The following options can be specified in the `.ws-localsync.json` file:
```json
{
    "docker": true,
    "dockerContainerName": "local-compose-cms-1",
    "modules": [
        {
            "source": ".",
            "dist": "target/dist/apps",
            "targetDir": "<project-name>"
        },
        {
            //...
        }
    ]
}
```

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
You need to be logged in to company's npm account. To log in use `npm login`. 
Credentials to https://www.npmjs.com/~dynamicsolutions:
- Username: dynamicsolutions
- password: reach @Michal Cukierman, (`forgot password` option in https://www.npmjs.com can be used)
- email: admin@ds.pl
- One Time Password: reach @Michal Cukierman

## Troubleshooting

### The dev files are not synchronised
Verify that the `Apache Sling File System Resource Provider (org.apache.sling.fsresource)` bundle is Active in http://localhost:8080/system/console/bundles/org.apache.sling.fsresource.
- if Status is `Resolved` you can activate the bundle

### You can see dev version of your code even though this script is not running

Go to `http://localhost:8080/system/console/configMgr` and search for `Apache Sling File System Resource Provider`. See if there are old mappings to your module and delete them.

