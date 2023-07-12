import { beforeEach, describe, expect, it } from 'vitest'
import { RegistoryBase } from './models.js'
import { PluginAlreadyInstalledError, PluginNotInstalledError } from './types.js'

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
      expect(() => registory.registerPlugin('test:', plugin)).toThrow(
        PluginAlreadyInstalledError
      )
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

    it('should throw an error if no plugin is registered', async () => {
      await expect(registory.from('not-registerd://')).rejects.toThrow(PluginNotInstalledError)
    })
  })
})
