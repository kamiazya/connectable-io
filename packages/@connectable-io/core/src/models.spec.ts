import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistryBase } from './models.js'
import { PluginAlreadyLoadedError, PluginNotLoadedError, ResourceBuildError } from './types.js'
import { subscribe } from 'diagnostics_channel'

describe('RegistryBase', () => {
  class TestRegistry extends RegistryBase<{ test: string }> {
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
      registry.load('test:', plugin)
      expect(registry.plugins.get('test:')).toBe(plugin)
    })

    it('should throw PluginAlreadyLoadedError if a plugin is already loaded', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registry.load('test:', plugin)
      expect(() => registry.load('test:', plugin)).toThrow(PluginAlreadyLoadedError)
    })

    it('should publish message to diagnostic channel "connectable-io.Test:onPluginLoaded" when a plugin is loaded', async () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      const onPluginLoaded = vi.fn()
      subscribe('connectable-io.Test:onPluginLoaded', onPluginLoaded)
      registry.load('test:', plugin)
      expect(onPluginLoaded).toBeCalledWith(
        {
          protocol: 'test:',
          plugin,
        },
        'connectable-io.Test:onPluginLoaded',
      )
    })
  })

  describe('from method', () => {
    it('should return an instance of plugin', async () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registry.load('test:', plugin)
      const instance = await registry.from('test://')
      expect(instance).toStrictEqual({
        test: 'test',
      })
    })

    it('should throw TypeError if invalid URL was given', async () => {
      await expect(registry.from('invalid')).rejects.toThrow(TypeError)
    })

    it('should throw PluginNotLoadedError if no plugin is loaded', async () => {
      await expect(registry.from('not-loaded://')).rejects.toThrow(PluginNotLoadedError)
    })

    it('should throw ResourceBuildError if failed to build an instance', async () => {
      registry.load('test:', {
        build: async () => {
          throw new Error('test')
        },
      })
      await expect(registry.from('test://')).rejects.toThrow(ResourceBuildError)
    })
  })
  describe('addDynamicPluginLoader method', () => {
    it('should add a dynamic plugin loader', () => {
      const loader = async () => {}
      registry.addDynamicPluginLoader('dynamic-load:', loader)
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load:', loader])
    })

    it('should dynamically resolve the plugin when specifies a pattern in the protocol', async () => {
      registry.addDynamicPluginLoader('dynamic-{:name}:', async ({ input, groups: { name } }) => {
        registry.load(`${input}:`, {
          build: async () => ({ test: name! }),
        })
      })

      await expect(registry.from('dynamic-test1://')).resolves.toStrictEqual({
        test: 'test1',
      })
      expect(registry.plugins.has('dynamic-test1:')).toBe(true)
      expect(registry.plugins.size).toBe(1)

      await expect(registry.from('dynamic-test2://')).resolves.toStrictEqual({
        test: 'test2',
      })
      expect(registry.plugins.has('dynamic-test2:')).toBe(true)
      expect(registry.plugins.size).toBe(2)
    })

    it('should add a dynamic plugin loader at the end of the list', () => {
      const loader = async () => {}
      registry.addDynamicPluginLoader('dynamic-load1:', loader)
      registry.addDynamicPluginLoader('dynamic-load2:', loader)
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load1:', loader])
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load2:', loader])
      expect(registry.dynamicLoaders[0][0]).toBe('dynamic-load1:')
      expect(registry.dynamicLoaders[1][0]).toBe('dynamic-load2:')

      registry.addDynamicPluginLoader('dynamic-load3:', loader)
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load1:', loader])
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load2:', loader])
      expect(registry.dynamicLoaders).toContainEqual(['dynamic-load3:', loader])
      expect(registry.dynamicLoaders[0][0]).toBe('dynamic-load1:')
      expect(registry.dynamicLoaders[1][0]).toBe('dynamic-load2:')
      expect(registry.dynamicLoaders[2][0]).toBe('dynamic-load3:')
    })

    it('should load a plugin if dynamic loader is set and the plugin is loaded', async () => {
      registry.addDynamicPluginLoader('dynamic-load:', async () => {
        registry.load('dynamic-load:', {
          build: async () => ({
            test: 'test',
          }),
        })
      })

      await expect(registry.from('dynamic-load://')).resolves.toStrictEqual({
        test: 'test',
      })
      expect(registry.plugins.has('dynamic-load:')).toBe(true)
    })

    it('should throw PluginNotLoadedError if no plugin is loaded but dynamic loader is set, but failed to execute dynamic loader', async () => {
      registry.addDynamicPluginLoader('dynamic-load:', async () => {
        registry.load('dynamic-load:', {
          build: async () => ({
            test: 'test',
          }),
        })
        throw new Error('test')
      })

      await expect(registry.from('dynamic-load://')).rejects.toThrow(PluginNotLoadedError)

      // Check plugin is not loaded
      expect(registry.plugins.has('dynamic-load:')).toBe(false)
    })

    it('should publish message to diagnostic channel "connectable-io.Test:onDynamicPluginLoaderAdded" when a dynamic loader is added', async () => {
      const loader = async () => {}
      const onDynamicPluginLoaderAdded = vi.fn()
      subscribe('connectable-io.Test:onDynamicPluginLoaderAdded', onDynamicPluginLoaderAdded)
      registry.addDynamicPluginLoader('dynamic-load:', loader)
      expect(onDynamicPluginLoaderAdded).toBeCalledWith(
        {
          pattern: 'dynamic-load:',
          loader,
        },
        'connectable-io.Test:onDynamicPluginLoaderAdded',
      )
    })
  })
})
