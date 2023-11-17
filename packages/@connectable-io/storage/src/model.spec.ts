import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Storage, StorageRegistry } from './models.js'
import { PluginNotLoadedError } from '@connectable-io/core'
import { subscribe } from 'node:diagnostics_channel'

describe('StorageRegistry', () => {
  let registry: StorageRegistry
  let storage: Storage

  beforeEach(() => {
    registry = new StorageRegistry()
    storage = {
      exists: vi.fn(),
      delete: vi.fn(),
      open: vi.fn(),
      list: vi.fn(),
    }
    registry.load('test', {
      async build() {
        return storage
      },
    })
  })

  describe('load method', () => {
    it('should publish message to diagnostic channel "connectable-io.Storage:onPluginLoaded" when a plugin is loaded', async () => {
      const onPluginLoaded = vi.fn()
      subscribe('connectable-io.Storage:onPluginLoaded', onPluginLoaded)
      registry.load('new', {
        async build() {
          return storage
        },
      })
      expect(onPluginLoaded).toBeCalledWith(
        {
          key: 'new',
          plugin: expect.any(Object),
        },
        'connectable-io.Storage:onPluginLoaded',
      )
    })
  })

  describe('addDynamicPluginLoader method', () => {
    it('should publish message to diagnostic channel "connectable-io.Storage:onPluginLoaded" when a plugin is loaded', async () => {
      const onDynamicPluginLoaderAdded = vi.fn()
      subscribe('connectable-io.Storage:onDynamicPluginLoaderAdded', onDynamicPluginLoaderAdded)
      const loader = async () => {
        registry.load('test', {
          async build() {
            return storage
          },
        })
      }
      registry.addDynamicPluginLoader('test+{:encoding}', loader)
      expect(onDynamicPluginLoaderAdded).toBeCalledWith(
        {
          pattern: 'test+{:encoding}',
          loader: loader,
        },
        'connectable-io.Storage:onDynamicPluginLoaderAdded',
      )
    })
  })

  describe('open method', () => {
    it('should open a file from storage', async () => {
      const fromSpy = vi.spyOn(registry, 'from')

      await registry.open('test://origin/package.json')
      expect(fromSpy).toBeCalledWith('test://origin/')
      expect(storage.open).toBeCalledWith('/package.json', undefined)
    })

    it('should throw an error if the scheme is not loaded', async () => {
      await expect(registry.open('unknown://origin/package.json')).rejects.toThrow(PluginNotLoadedError)
    })

    it('should propagation options to open method of storage', async () => {
      await registry.open('test://origin/package.json', { read: true })
      expect(storage.open).toBeCalledWith('/package.json', { read: true })
    })
  })
})
