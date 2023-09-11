import { beforeEach, describe, expect, it } from 'vitest'
import { RegistoryBase } from './models.js'
import { PluginAlreadyLoadedError, PluginNotLoadedError } from './types.js'

describe('RegistoryBase', () => {
  let registory: RegistoryBase<{
    test: string
  }>
  beforeEach(async () => {
    registory = new RegistoryBase()
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

    it('should throw an error if a plugin is already loaded', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registory.load('test:', plugin)
      expect(() => registory.load('test:', plugin)).toThrow(PluginAlreadyLoadedError)
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

    it('should throw an error if invalid URL was given', async () => {
      await expect(registory.from('invalid')).rejects.toThrow(TypeError)
    })

    it('should throw an error if no plugin is loaded', async () => {
      await expect(registory.from('not-loaded://')).rejects.toThrow(PluginNotLoadedError)
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

    it('shold throw an error if no plugin is loaded but dunamic loader is set, but failed to execute dynamic loader', async () => {
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
  })
})
