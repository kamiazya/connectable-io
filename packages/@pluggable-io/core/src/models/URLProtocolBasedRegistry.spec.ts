import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import { URLProtocolBasedRegistry } from './URLProtocolBasedRegistry.js'
import { PluginNotLoadedError, ResourceBuildError } from '../types.js'

describe('URLProtocolBasedRegistry', () => {
  let registry: URLProtocolBasedRegistry<string>
  let plugin: { build: (...args: any[]) => Promise<string> }

  beforeEach(() => {
    registry = new URLProtocolBasedRegistry('Test')
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
    it.only('should call the loader for the matching pattern', async () => {
      const loader = vi.fn(async () => {
        registry.load('dynamic-example', plugin)
      })
      registry.addDynamicPluginLoader(
        {
          protocol: 'dynamic-:option',
        },
        loader,
      )
      await registry.from('dynamic-example://dynamic')
      expect(loader).toBeCalledWith('dynamic-example://dynamic', { option: 'example' })
    })

    it('should not call any loader if no pattern matches', async () => {
      const loader = vi.fn(async () => {})
      registry.addDynamicPluginLoader(
        {
          protocol: 'dynamic-{:option}',
        },
        loader,
      )
      expect(registry.from('unknown://')).rejects.toThrow(PluginNotLoadedError)
      expect(loader).not.toBeCalled()
    })
  })
})
