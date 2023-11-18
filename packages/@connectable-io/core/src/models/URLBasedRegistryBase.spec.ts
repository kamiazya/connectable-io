import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import { URLBasedRegistryBase } from './URLBasedRegistryBase.js'
import { PluginNotLoadedError, ResourceBuildError } from '../types.js'

describe('URLBasedRegistryBase', () => {
  let registry: URLBasedRegistryBase<string>
  let plugin: { build: (...args: any[]) => Promise<string> }

  beforeEach(() => {
    registry = new URLBasedRegistryBase('Test')
    plugin = { build: vi.fn(async () => 'test') }
    registry.load('test', plugin)
  })

  describe('from method', () => {
    it('should return the resource for the given key', async () => {
      const result = await registry.from('test://test')
      expect(result).toBe('test')
      expect(plugin.build).toBeCalledWith('test://test')
    })

    it('should throw a PluginNotLoadedError if no plugin is loaded for the given key', async () => {
      await expect(registry.from('unknown://')).rejects.toThrow(PluginNotLoadedError)
    })

    it('should throw a ResourceBuildError if the plugin build method throws an error', async () => {
      // eslint-disable-next-line no-extra-semi
      ;(plugin.build as Mock).mockRejectedValueOnce(new Error('test error'))
      await expect(registry.from('test://test')).rejects.toThrow(ResourceBuildError)
      expect(plugin.build).toBeCalledWith('test://test')
    })
  })

  describe('addDynamicPluginLoader method', () => {
    it.each([
      {
        protocol: 'dynamic-{:option}',
      },
      {
        protocol: 'dynamic-{:option}',
        host: 'example.com',
      },
      'dynamic-{:option}://**',
    ])('should call the loader for the matching pattern', async (pattern) => {
      const load = vi.fn(async () => registry.load('dynamic-example', plugin))
      registry.addDynamicPluginLoader({ pattern, load })
      await registry.from('dynamic-example://dynamic')
      expect(load).toBeCalledWith('dynamic-example://dynamic', { option: 'example' })
    })

    it.each([
      {
        protocol: 'dynamic-{:option}',
      },
      {
        protocol: 'dynamic-{:option}',
        host: 'example.com',
      },
      'dynamic-{:option}://**',
    ])('should not call any loader if no pattern matches', async (pattern) => {
      const load = vi.fn(async () => {
        /* noop */
      })
      registry.addDynamicPluginLoader({ pattern, load })
      expect(registry.from('unknown://')).rejects.toThrow(PluginNotLoadedError)
      expect(load).not.toBeCalled()
    })
  })
})
