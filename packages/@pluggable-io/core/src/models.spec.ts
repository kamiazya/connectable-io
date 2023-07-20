import { beforeEach, describe, expect, it } from 'vitest'
import { RegistoryBase } from './models.js'
import { PluginAlreadyRegisteredError, PluginNotRegisteredError } from './types.js'

describe('RegistoryBase', () => {
  let registory: RegistoryBase<{
    test: string
  }>
  beforeEach(async () => {
    registory = new RegistoryBase()
  })
  describe('registerPlugin function', () => {
    it('should register a plugin', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registory.registerPlugin('test:', plugin)
      expect(registory.plugins.get('test:')).toBe(plugin)
    })

    it('should throw an error if a plugin is already registered', () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registory.registerPlugin('test:', plugin)
      expect(() => registory.registerPlugin('test:', plugin)).toThrow(PluginAlreadyRegisteredError)
    })
  })
  describe('from function', () => {
    it('should return an instance of plugin', async () => {
      const plugin = {
        build: async () => ({
          test: 'test',
        }),
      }
      registory.registerPlugin('test:', plugin)
      const instance = await registory.from('test://')
      expect(instance).toStrictEqual({
        test: 'test',
      })
    })

    it('should throw an error if invalid URL was given', async () => {
      await expect(registory.from('invalid')).rejects.toThrow(TypeError)
    })

    it('should throw an error if no plugin is registered', async () => {
      await expect(registory.from('not-registerd://')).rejects.toThrow(PluginNotRegisteredError)
    })

    it('should not throw an error if no plugin is registered but PLUGIN_PLUG_AND_PLAY is set and the plugin is not registered', async () => {
      registory.PLUGIN_PLUG_AND_PLAY['not-registerd:'] = async () => {
        registory.registerPlugin('not-registerd:', {
          build: async () => ({
            test: 'test',
          }),
        })
      }
      await expect(registory.from('not-registerd://')).resolves.toStrictEqual({
        test: 'test',
      })
    })

    it('shold throw an error if no plugin is registered but PLUGIN_PLUG_AND_PLAY is set, but failed to execute PLUGIN_PLUG_AND_PLAY', async () => {
      registory.PLUGIN_PLUG_AND_PLAY['not-registerd:'] = async () => {
        registory.registerPlugin('not-registerd:', {
          build: async () => ({
            test: 'test',
          }),
        })
        throw new Error('test')
      }
      await expect(registory.from('not-registerd://')).rejects.toThrow(PluginNotRegisteredError)

      // Check plugin is not registered
      expect(registory.plugins.has('not-registerd:')).toBe(false)
      // Check if PLUGIN_PLUG_AND_PLAY is removed
      expect(registory.PLUGIN_PLUG_AND_PLAY['not-registerd:']).toBe(undefined)
    })
  })
})
