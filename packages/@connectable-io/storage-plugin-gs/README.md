# @connectable-io/storage-plugin-gs

This package provides a storage plugin for the Connectable IO system that allows you to interact with Google Cloud Storage as a storage medium.

## Installation

```bash
npm install @connectable-io/storage-plugin-gs
```

## Usage

### Set up

#### Plug-n-Play

For a quick setup, simply import the pnp package. It will automatically register the Google Cloud Storage plugin.

```ts
import '@connectable-io/storage-plugin-gs/pnp'
```

#### Manual Setup using `registerPlugin`

Alternatively, if you want more control over the registration process, you can manually register the plugin.

```ts
import { Storage } from '@connectable-io/storage'
import { GoogleCloudStoragePlugin } from '@connectable-io/storage-plugin-gs'

Storage.registerPlugin('gs:', new GoogleCloudStoragePlugin())
```

### Using the Storage Plugin

After setting up, you can use the Connectable IO storage system to interact with Google Cloud Storage.

```ts
const storage = await Storage.from('gs://my-bucket/path/of/prefix')
```

## Contributing

Feedback, bug reports, and pull requests are welcome!
