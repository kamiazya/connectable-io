import { subscribe } from 'node:diagnostics_channel'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistryBase } from './RegistryBase.js'
import { PluginAlreadyLoadedError } from '../types.js'

describe('RegistryBase', () => {
  class TestRegistry extends RegistryBase<{ test: string }, []> {
    _buildResource(): Promise<{ test: string }> {
      throw new Error('Method not implemented.')
    }
    _dynamicPluginLoad(): Promise<void> {
      throw new Error('Method not implemented.')
    }
    constructor() {
      super('Test')
    }
  }

  let registry: TestRegistry
  beforeEach(async () => {
    registry = new TestRegistry()
  })
  describe('load method', () => {
    it('should load a plugin', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registry.load('test', plugin)
      expect(registry.plugins.get('test')).toBe(plugin)
    })

    it('should throw PluginAlreadyLoadedError if a plugin is already loaded', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registry.load('test', plugin)
      expect(() => registry.load('test', plugin)).toThrow(PluginAlreadyLoadedError)
    })

    it('should publish message to diagnostic channel "connectable-io.Test:onPluginLoaded" when a plugin is loaded', async () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      const onPluginLoaded = vi.fn()
      subscribe('connectable-io.Test:onPluginLoaded', onPluginLoaded)
      registry.load('test', plugin)
      expect(onPluginLoaded).toBeCalledWith(
        {
          key: 'test',
          plugin,
        },
        'connectable-io.Test:onPluginLoaded',
      )
    })
  })

  describe('addDynamicPluginLoader method', () => {
    it('should add a dynamic plugin loader', () => {
      const loader = async () => {}
      registry.addDynamicPluginLoader('dynamic-load', loader)
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load', loader])
    })

    it('should publish message to diagnostic channel "connectable-io.Test:onDynamicPluginLoaderAdded" when a dynamic loader is added', async () => {
      const loader = async () => {}
      const onDynamicPluginLoaderAdded = vi.fn()
      subscribe('connectable-io.Test:onDynamicPluginLoaderAdded', onDynamicPluginLoaderAdded)
      registry.addDynamicPluginLoader('dynamic-load', loader)
      expect(onDynamicPluginLoaderAdded).toBeCalledWith(
        {
          pattern: 'dynamic-load',
          loader,
        },
        'connectable-io.Test:onDynamicPluginLoaderAdded',
      )
    })
  })
})
