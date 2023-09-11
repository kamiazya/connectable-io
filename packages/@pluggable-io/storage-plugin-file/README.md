# @pluggable-io/storage-plugin-file

This package provides a storage plugin for the Pluggable IO system
that allows you to interact with the local file system as a storage medium.

## Installation

```bash
npm install @pluggable-io/storage-plugin-file
```

## Usage

### Set up

#### Plug-n-Play

For a quick setup, simply import the pnp package.
It will automatically register the file system storage plugin.

```ts
import '@pluggable-io/storage-plugin-file/pnp'
```

#### Manual Setup using `registerPlugin`

Alternatively, if you want more control over the registration process,
you can manually register the plugin.

```ts
import { Storage } from '@pluggable-io/storage'
import { FileSystemStoragePlugin } from '@pluggable-io/storage-plugin-file'

Storage.registerPlugin('file:', new FileSystemStoragePlugin())
```

When manually registering the plugin using registerPlugin,
you can provide options to configure the behavior of the `FileSystemStoragePlugin`.

Here are the available options:

- `baseDir`

  Specifies the base directory for storage. This can be an absolute or relative path.

  Default is `'.'` (current directory).

- `createIfNotExists`

  If set to true, the plugin will automatically create the base directory if it doesn't exist.

  Default is `false`.

```ts
Storage.registerPlugin(
  'file:',
  new FileSystemStoragePlugin({
    baseDir: './path/to/storage', // Set the base directory
    createIfNotExists: true, // Automatically create the directory if it doesn't exist
  }),
)
```

> **Note**
> If already registered `"file:"` protocol, you can use another protocol like `"file+custom:"`.

### Using the Storage Plugin

After setting up, you can use the Pluggable IO storage system to interact with the local file system.

#### Creating a Storage Instance With a Relative Path

```ts
const storage = await Storage.from('file://./path/to/resource')
```

#### Creating a Storage Instance With an Absolute Path

```ts
const storage = await Storage.from('file:///absolute/path/to/resource')
```

## Contributing

Feedback, bug reports, and pull requests are welcome!