# @pluggable-io/core

This package provides a registry system for resources,
allowing you to register plugins based on specific protocols and construct resource instances from URLs.

This package offers a unified interface for managing various resources.

## Features

- **Resource Registry**

  Create a new registry instance and register plugins for specific protocols.

- **Unified Resource Retrieval**

  Construct resource instances from URLs using loaded plugins.

- **Error Handling**

  Handle scenarios where a plugin is already loaded or a protocol is not loaded.

## Installation

```bash
npm install @pluggable-io/core
```

## Usage

### 1. Importing Types

Import the main types and interfaces provided by `@pluggable-io/core`.

```typescript
import { Registory, ResourcePlugin, PluginNotLoadedError, PluginAlreadyLoadedError } from '@pluggable-io/core'
```

### 2. Using the Registory

Create a new registry instance and register plugins.

```typescript
interface SampleResource {
  // ... some interface
}

class SampleResourceRegistory extends RegistoryBase<SampleResource> {
  // ... some custom logic
}

const registory = new SampleResourceRegistory()

registory.registerPlugin('sample:', {
  async build(url) {
    // return a new resource instance
    return new SampleResourceAdapter(url)
  },
})
```

### 3. Retrieving Resources

Retrieve resource instances using loaded plugins.

```typescript
const resource = await registory.from('sample://url/of/resource')
```

## Contributing

Feedback, bug reports, and pull requests are welcome!
