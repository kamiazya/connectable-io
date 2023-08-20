# Basic Design Document

## Introduction

This project is a modular system designed to offer pluggable interfaces for various resources.

This document outlines the core concepts, architecture, and design principles behind this project.

## 1. Core Concepts

### 1.1. Pluggability

- **Definition**: The ability to easily extend and adapt to different storage solutions or protocols by integrating necessary modules.
- **Benefit**: Provides flexibility and scalability, allowing the system to evolve with changing requirements.

### 1.2 Unified Interface

- **Definition**: A consistent interface to interact with, regardless of the underlying storage or protocol.
- **Benefit**: Simplifies integration and reduces the learning curve for developers.

### 1.3 Flexibility

- **Definition**: Designed with adaptability in mind, making it suitable for projects that evolve over time.
- **Benefit**: Reduces the need for major overhauls or redesigns as requirements change.

## 2. Architecture

### 2.1 Package Naming Convention and Structure

Each package within Pluggable IO follows a consistent naming pattern, ensuring clarity and easy identification.

- **Common**: `@pluggable-io/common`
  - Contains common types and interfaces used across the system.
- **Core**: `@pluggable-io/core`
  - Contains the foundational elements and interfaces for the system.
- **Resources**: `@pluggable-io/{resource}`
  - Provides the core functionalities for resource management.
  - _Examples_
    - `@pluggable-io/storage` - Deals with file system interactions.
    - `@pluggable-io/logger` - Handles logging functionalities.
- **Resource Plugins**: `@pluggable-io/{resource}-plugin-{protocol}`
  - Provides the necessary modules for integrating with specific protocols. These are designed to be imported and used by other programs.
  - _Examples_
    - `@pluggable-io/storage-plugin-file` - Integrates with the local file system.
    - `@pluggable-io/storage-plugin-s3` - Integrates with AWS S3.
    - `@pluggable-io/logger-plugin-console` - Integrates with the console.
- **Plug-n-Play (PnP) Resource Plugins**: `@pluggable-io/{resource}-plugin-{protocol}/pnp`
  - When imported, these plugins are immediately registered with the default schema in the registry and are ready for use.
    They inherently import and utilize the corresponding `@pluggable-io/{resource}-plugin-{protocol}` package, ensuring extensibility and consistency.
  - _Examples_
    - `@pluggable-io/storage-plugin-file/pnp` - Plug-n-play integration with the local file system.
    - `@pluggable-io/storage-plugin-s3/pnp` - Plug-n-play integration with AWS S3.
- **Presets**: `@pluggable-io/preset-{preset}` - Provides a set of plugins for a specific use case.
  - _Examples_
    - `@pluggable-io/preset-standard` - Provides a set of plugins for common use cases.
    - `@pluggable-io/preset-aws` - Provides a set of plugins for AWS.
- **Easy API**: `pluggable-io`
  - This package is designed with user-friendliness in mind.
    Even for those unfamiliar with the project's philosophy, the Easy API ensures a seamless experience.
    By leveraging the Plug-n-Play mechanism, users can quickly start using the functionalities without any intricate setup.
    It embodies the essence of immediate usability while maintaining the project's core principles.

### 2.2 Ensuring Extensibility

- **Plugin System**: At the heart of Pluggable IO's extensibility is its plugin system. By abstracting functionalities into plugins, new storage solutions or protocols can be added without altering the core system.
- **Unified Interfaces**: By maintaining consistent interfaces, developers can integrate new plugins with minimal friction. This design ensures that as new plugins are added, the overall system remains cohesive and intuitive.
- **Registory**: The Registory plays a crucial role in managing plugins. It allows for dynamic registration and retrieval of plugins based on protocols, ensuring the system can adapt to new requirements on-the-fly.
- **Plug-n-Play (PnP) Mechanism**: The PnP packages provide an immediate, hassle-free integration experience. By building on top of the core plugin packages, they ensure that the system remains extensible while offering a streamlined setup for common use cases.

## 3. Design Principles

### 3.1 Modularity

Each component is designed to be independent, ensuring that changes in one module do not adversely affect others.

### 3.2 Extensibility

The system is built with extensibility in mind, allowing for the easy addition of new plugins or modules.

### 3.3 Consistency

Despite the pluggable nature, a consistent interface is maintained to ensure a uniform experience.

## 4. Future Directions

As This project is still in the development phase, there are plans to:

- Expand the range of supported plugins.
- Enhance the core functionalities based on user feedback.
- Improve documentation and provide more examples for developers.
