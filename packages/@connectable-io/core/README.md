# @connectable-io/core

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
npm install @connectable-io/core
```

## Usage

### 1. Importing Types

Import the main types and interfaces provided by `@connectable-io/core`.

```typescript
import { Registry, ResourcePlugin, PluginNotLoadedError, PluginAlreadyLoadedError } from '@connectable-io/core'
```

### 2. Using the Registry

Create a new registry instance and register plugins.

```typescript
interface SampleResource {
  // ... some interface
}

class SampleResourceRegistry extends RegistryBase<SampleResource> {
  // ... some custom logic
}

const registry = new SampleResourceRegistry()

registry.registerPlugin('sample:', {
  async build(url) {
    // return a new resource instance
    return new SampleResourceAdapter(url)
  },
})
```

### 3. Retrieving Resources

Retrieve resource instances using loaded plugins.

```typescript
const resource = await registry.from('sample://url/of/resource')
```

## Contributing

Feedback, bug reports, and pull requests are welcome!
