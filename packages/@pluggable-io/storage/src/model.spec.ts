import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Storage, StorageRegistory } from './models.js'
import { PluginNotLoadedError } from '@pluggable-io/core'
import { subscribe } from 'node:diagnostics_channel'

describe('StorageRegistory', () => {
  let registyory: StorageRegistory
  let storage: Storage

  beforeEach(() => {
    registyory = new StorageRegistory()
    storage = {
      exists: vi.fn(),
      delete: vi.fn(),
      open: vi.fn(),
      list: vi.fn(),
    }
    registyory.load('test:', {
      async build() {
        return storage
      },
    })
  })

  describe('load method', () => {
    it('should publish message to diagnostic channel "pluggable-io.Storage:onPluginLoaded" when a plugin is loaded', async () => {
      const onPluginLoaded = vi.fn()
      subscribe('pluggable-io.Storage:onPluginLoaded', onPluginLoaded)
      registyory.load('new:', {
        async build() {
          return storage
        },
      })
      expect(onPluginLoaded).toBeCalledWith(
        {
          protocol: 'new:',
          plugin: expect.any(Object),
        },
        'pluggable-io.Storage:onPluginLoaded',
      )
    })
  })

  describe('addDynamicPluginLoader method', () => {
    it('should publish message to diagnostic channel "pluggable-io.Storage:onPluginLoaded" when a plugin is loaded', async () => {
      const onDynamicPluginLoaderAdded = vi.fn()
      subscribe('pluggable-io.Storage:onDynamicPluginLoaderAdded', onDynamicPluginLoaderAdded)
      const loader = async () => {
        registyory.load('test:', {
          async build() {
            return storage
          },
        })
      }
      registyory.addDynamicPluginLoader('test+{:encoding}:', loader)
      expect(onDynamicPluginLoaderAdded).toBeCalledWith(
        {
          pattern: 'test+{:encoding}:',
          loader: loader,
        },
        'pluggable-io.Storage:onDynamicPluginLoaderAdded',
      )
    })
  })

  describe('open method', () => {
    it('should open a file from storage', async () => {
      const fromSpy = vi.spyOn(registyory, 'from')

      await registyory.open('test://origin/package.json')
      expect(fromSpy).toBeCalledWith('test://origin/')
      expect(storage.open).toBeCalledWith('/package.json', undefined)
    })

    it('should throw an error if the scheme is not loaded', async () => {
      await expect(registyory.open('unknown://origin/package.json')).rejects.toThrow(PluginNotLoadedError)
    })

    it('should propagation options to open method of storage', async () => {
      await registyory.open('test://origin/package.json', { read: true })
      expect(storage.open).toBeCalledWith('/package.json', { read: true })
    })
  })
})
