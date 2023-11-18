import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'
import { KeyBasedRegistry } from './KeyBasedRegistry.js'
import { PluginNotLoadedError, ResourceBuildError } from '../types.js'

describe('KeyBasedRegistry', () => {
  let registry: KeyBasedRegistry<string>
  let plugin: { build: (...args: any[]) => Promise<string> }

  beforeEach(() => {
    registry = new KeyBasedRegistry('Test')
    plugin = { build: vi.fn(async () => 'test') }
    registry.load('test', plugin)
  })

  describe('from method', () => {
    it('should return the resource for the given key', async () => {
      const result = await registry.from('test')
      expect(result).toBe('test')
      expect(plugin.build).toBeCalledWith('test')
    })

    it('should throw a PluginNotLoadedError if no plugin is loaded for the given key', async () => {
      await expect(registry.from('unknown')).rejects.toThrow(PluginNotLoadedError)
    })

    it('should throw a ResourceBuildError if the plugin build method throws an error', async () => {
      // eslint-disable-next-line no-extra-semi
      ;(plugin.build as Mock).mockRejectedValueOnce(new Error('test error'))
      await expect(registry.from('test')).rejects.toThrow(ResourceBuildError)
      expect(plugin.build).toBeCalledWith('test')
    })
  })

  describe('addDynamicPluginLoader method', () => {
    it('should call the loader for the matching pattern', async () => {
      const load = vi.fn(async () => {
        registry.load('test+option', plugin)
      })
      registry.addDynamicPluginLoader({
        pattern: /^test\+(?<option>.+)$/,
        load,
      })
      await registry.from('test+option')
      expect(load).toBeCalledWith('test+option', { option: 'option' })
    })

    it('should not call any loader if no pattern matches', async () => {
      const load = vi.fn(async () => {})
      registry.addDynamicPluginLoader({
        pattern: /^test\+(?<option>.+)$/,
        load,
      })
      expect(registry.from('unknown')).rejects.toThrow(PluginNotLoadedError)
      expect(load).not.toBeCalled()
    })
  })
})
