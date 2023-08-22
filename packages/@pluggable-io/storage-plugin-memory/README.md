# @pluggable-io/storage-plugin-memory

This package provides an in-memory storage plugin for the Pluggable IO system.

It allows you to interact with a virtual memory-based storage medium,
which can be particularly useful for testing and development scenarios where persistence is not required.

## Installation

```bash
npm install @pluggable-io/storage-plugin-memory
```

## Usage

### Set up

#### Plug-n-Play

For a quick setup, simply import the pnp package. It will automatically register the memory storage plugin.

```ts
import '@pluggable-io/storage-plugin-memory/pnp'
```

#### Manual Setup using `registerPlugin`

Alternatively, if you want more control over the registration process, you can manually register the plugin.

```ts
import { Storage } from '@pluggable-io/storage'
import { MemoryStoragePlugin } from '@pluggable-io/storage-plugin-memory'

Storage.registerPlugin('memory:', new MemoryStoragePlugin())
```

### Using the Storage Plugin

After setting up, you can use the Pluggable IO storage system to interact with the in-memory storage.

```ts
const storage = await Storage.from('memory:')
```

This will create a new in-memory storage instance.

## Benefits

- **Fast Access**

  Since the data is stored in memory, access times are extremely fast, making it ideal for testing and development.

- **No Persistence**

  Perfect for scenarios where data persistence across sessions is not required, such as temporary data storage or mock testing.

- **Simplified Testing**

  Easily mock storage functionalities without the need for external dependencies or setups.

- **Consistent API**

  Offers the same API as other storage plugins in the Pluggable IO system, ensuring a seamless integration experience.

## Contributing

Feedback, bug reports, and pull requests are welcome!
