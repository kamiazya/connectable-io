# @pluggable-io/storage

This package offers a unified interface for managing storage resources.

With the help of plugins, you can easily integrate various storage backends,
such as the local file system, cloud storage, and more.

## Features

- **Unified Storage Interface**

  Use a consistent API to interact with different storage backends.

- **Extensible with Plugins**

  Easily extend the storage capabilities by registering plugins for specific storage types.

- **Error Handling**

  Gracefully handle scenarios like file not found, and more.

## Installation

```bash
npm install @pluggable-io/storage
```

## Usage

### 1. Importing Types

First, import the necessary types and interfaces provided by `@pluggable-io/storage`.

```ts
import { Storage, FileNotExixtsError } from '@pluggable-io/storage'
```

### 2. Using the File System Storage Plugin

To use the local file system as a storage backend, you'll need the `@pluggable-io/storage-plugin-file` package.

```bash
npm install @pluggable-io/storage-plugin-file
```

Then, integrate it into your application:

```ts
import '@pluggable-io/storage-plugin-file/pnp'

const storage = await Storage.from('file://./path/to/storage')
```

You can also use an absolute path:

```ts
const storage = await Storage.from('file:///absolute/path/to/storage')
```

### 3. Interacting with Storage

Once you have a storage instance, you can perform various operations:

```ts
// Check if a file exists
const exists = await storage.exists('path/to/file')

// Delete a file
await storage.delete('path/to/file')

// List files in a directory
const files = await storage.list('path/to/directory')
```

## Advanced Usage

### Creating a Custom Storage Plugin

To create a custom storage plugin, you'll need to:

1. Implement the Storage interface.
1. Define the `build` method to handle the creation of your storage instance.
1. Register your custom plugin using the `registerPlugin` method of the `Storage` class.

For example, the `@pluggable-io/storage-plugin-file` package provides a FileSystemStoragePlugin that allows you to use the local file system as a storage backend.

### Contributing

Feedback, bug reports, and pull requests are welcome!
