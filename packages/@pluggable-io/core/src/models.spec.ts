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

    it('should not throw an error if no plugin is loaded but PLUGIN_PLUG_AND_PLAY is set and the plugin is not loaded', async () => {
      registory.PLUGIN_PLUG_AND_PLAY['not-loaded:'] = async () => {
        registory.load('not-loaded:', {
          build: async () => ({
            test: 'test',
          }),
        })
      }
      await expect(registory.from('not-loaded://')).resolves.toStrictEqual({
        test: 'test',
      })
    })

    it('shold throw an error if no plugin is loaded but PLUGIN_PLUG_AND_PLAY is set, but failed to execute PLUGIN_PLUG_AND_PLAY', async () => {
      registory.PLUGIN_PLUG_AND_PLAY['not-loaded:'] = async () => {
        registory.load('not-loaded:', {
          build: async () => ({
            test: 'test',
          }),
        })
        throw new Error('test')
      }
      await expect(registory.from('not-loaded://')).rejects.toThrow(PluginNotLoadedError)

      // Check plugin is not loaded
      expect(registory.plugins.has('not-loaded:')).toBe(false)
      // Check if PLUGIN_PLUG_AND_PLAY is removed
      expect(registory.PLUGIN_PLUG_AND_PLAY['not-loaded:']).toBe(undefined)
    })
  })
})
