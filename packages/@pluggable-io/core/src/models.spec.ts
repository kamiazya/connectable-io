import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistoryBase } from './models.js'
import { PluginAlreadyLoadedError, PluginNotLoadedError, ResourceBuildError } from './types.js'
import { subscribe } from 'diagnostics_channel'

describe('RegistoryBase', () => {
  class TestRegistory extends RegistoryBase<{ test: string }> {
    constructor() {
      super('Test')
    }
  }

  let registory: TestRegistory
  beforeEach(async () => {
    registory = new TestRegistory()
  })
  describe('load method', () => {
    it('should load a plugin', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registory.load('test:', plugin)
      expect(registory.plugins.get('test:')).toBe(plugin)
    })

    it('should throw PluginAlreadyLoadedError if a plugin is already loaded', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registory.load('test:', plugin)
      expect(() => registory.load('test:', plugin)).toThrow(PluginAlreadyLoadedError)
    })

    it('should publish message to diagnostic channel "pluggable-io.Test:onPluginLoaded" when a plugin is loaded', async () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      const onPluginLoaded = vi.fn()
      subscribe('pluggable-io.Test:onPluginLoaded', onPluginLoaded)
      registory.load('test:', plugin)
      expect(onPluginLoaded).toBeCalledWith(
        {
          protocol: 'test:',
          plugin,
        },
        'pluggable-io.Test:onPluginLoaded',
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
      registory.load('test:', plugin)
      const instance = await registory.from('test://')
      expect(instance).toStrictEqual({
        test: 'test',
      })
    })

    it('should throw TypeError if invalid URL was given', async () => {
      await expect(registory.from('invalid')).rejects.toThrow(TypeError)
    })

    it('should throw PluginNotLoadedError if no plugin is loaded', async () => {
      await expect(registory.from('not-loaded://')).rejects.toThrow(PluginNotLoadedError)
    })

    it('should throw ResourceBuildError if failed to build an instance', async () => {
      registory.load('test:', {
        build: async () => {
          throw new Error('test')
        },
      })
      await expect(registory.from('test://')).rejects.toThrow(ResourceBuildError)
    })
  })
  describe('addDynamicPluginLoader method', () => {
    it('should add a dynamic plugin loader', () => {
      const loader = async () => {}
      registory.addDynamicPluginLoader('dynamic-load:', loader)
      expect(registory.dynamicLoaders).toContainEqual(['dynamic-load:', loader])
    })

    it('should dynamically resolve the plugin when specifies a pattern in the protocol', async () => {
      registory.addDynamicPluginLoader('dynamic-{:name}:', async ({ input, groups: { name } }) => {
        registory.load(`${input}:`, {
          build: async () => ({ test: name! }),
        })
      })

      await expect(registory.from('dynamic-test1://')).resolves.toStrictEqual({
        test: 'test1',
      })
      expect(registory.plugins.has('dynamic-test1:')).toBe(true)
      expect(registory.plugins.size).toBe(1)

      await expect(registory.from('dynamic-test2://')).resolves.toStrictEqual({
        test: 'test2',
      })
      expect(registory.plugins.has('dynamic-test2:')).toBe(true)
      expect(registory.plugins.size).toBe(2)
    })

    it('should add a dynamic plugin loader at the end of the list', () => {
      const loader = async () => {}
      registory.addDynamicPluginLoader('dynamic-load1:', loader)
      registory.addDynamicPluginLoader('dynamic-load2:', loader)
      expect(registory.dynamicLoaders).toContainEqual(['dynamic-load1:', loader])
      expect(registory.dynamicLoaders).toContainEqual(['dynamic-load2:', loader])
      expect(registory.dynamicLoaders[0][0]).toBe('dynamic-load1:')
      expect(registory.dynamicLoaders[1][0]).toBe('dynamic-load2:')

      registory.addDynamicPluginLoader('dynamic-load3:', loader)
      expect(registory.dynamicLoaders).toContainEqual(['dynamic-load1:', loader])
      expect(registory.dynamicLoaders).toContainEqual(['dynamic-load2:', loader])
      expect(registory.dynamicLoaders).toContainEqual(['dynamic-load3:', loader])
      expect(registory.dynamicLoaders[0][0]).toBe('dynamic-load1:')
      expect(registory.dynamicLoaders[1][0]).toBe('dynamic-load2:')
      expect(registory.dynamicLoaders[2][0]).toBe('dynamic-load3:')
    })

    it('should load a plugin if dynamic loader is set and the plugin is loaded', async () => {
      registory.addDynamicPluginLoader('dynamic-load:', async () => {
        registory.load('dynamic-load:', {
          build: async () => ({
            test: 'test',
          }),
        })
      })

      await expect(registory.from('dynamic-load://')).resolves.toStrictEqual({
        test: 'test',
      })
      expect(registory.plugins.has('dynamic-load:')).toBe(true)
    })

    it('shold throw PluginNotLoadedError if no plugin is loaded but dunamic loader is set, but failed to execute dynamic loader', async () => {
      registory.addDynamicPluginLoader('dynamic-load:', async () => {
        registory.load('dynamic-load:', {
          build: async () => ({
            test: 'test',
          }),
        })
        throw new Error('test')
      })

      await expect(registory.from('dynamic-load://')).rejects.toThrow(PluginNotLoadedError)

      // Check plugin is not loaded
      expect(registory.plugins.has('dynamic-load:')).toBe(false)
    })

    it('should publish message to diagnostic channel "pluggable-io.Test:onDynamicPluginLoaderAdded" when a dynamic loader is added', async () => {
      const loader = async () => {}
      const onDynamicPluginLoaderAdded = vi.fn()
      subscribe('pluggable-io.Test:onDynamicPluginLoaderAdded', onDynamicPluginLoaderAdded)
      registory.addDynamicPluginLoader('dynamic-load:', loader)
      expect(onDynamicPluginLoaderAdded).toBeCalledWith(
        {
          pattern: 'dynamic-load:',
          loader,
        },
        'pluggable-io.Test:onDynamicPluginLoaderAdded',
      )
    })
  })
})
