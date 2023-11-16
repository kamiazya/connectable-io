import { describe, expect, it, vi, beforeEach } from 'vitest'
import { FileSystemStoragePlugin } from './FileSystemStoragePlugin.js'
import { join, resolve } from 'node:path'
import { FileSystemStorageAdapter } from '../adapters/FileSystemStorageAdapter.js'
import { mkdir } from 'node:fs/promises'

vi.mock('node:fs/promises')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('FileSystemStoragePlugin', () => {
  describe('constructor', () => {
    describe('baseDir option', () => {
      describe('when given an absolute path', () => {
        it('should set baseDir', () => {
          const plugin = new FileSystemStoragePlugin({
            baseDir: '/foo',
          })
          expect(plugin.baseDir).toBe('/foo')
        })
      })
      describe('when given a relative path', () => {
        it('should set baseDir', () => {
          const plugin = new FileSystemStoragePlugin({
            baseDir: 'foo',
          })
          expect(plugin.baseDir).toBe(join(process.cwd(), 'foo'))
        })
      })

      it('should set the baseDir to process.cwd() by default', () => {
        const plugin = new FileSystemStoragePlugin()
        expect(plugin.baseDir).toBe(process.cwd())
      })
    })

    describe('createDirectoryIfNotExists option', () => {
      it('should set createDirectoryIfNotExists', () => {
        const plugin = new FileSystemStoragePlugin({
          createDirectoryIfNotExists: true,
        })
        expect(plugin.createDirectoryIfNotExists).toBe(true)
      })

      it('should set createDirectoryIfNotExists to true by default', () => {
        const plugin = new FileSystemStoragePlugin()
        expect(plugin.createDirectoryIfNotExists).toBe(true)
      })
    })
  })

  describe('build', () => {
    it('should return a FileSystemStorageAdapter', async () => {
      const plugin = new FileSystemStoragePlugin()
      const storage = await plugin.build(new URL('file://'))
      expect(storage).toBeInstanceOf(FileSystemStorageAdapter)
    })

    it('should set the urlSchema to the protocol of the url', async () => {
      const plugin = new FileSystemStoragePlugin()
      const storage = await plugin.build(new URL('file://'))
      expect(storage.urlSchema).toBe('file:')
    })

    it('should set the baseDir to the host and absolute pathname of the url', async () => {
      const plugin = new FileSystemStoragePlugin({ createDirectoryIfNotExists: false })
      const storage = await plugin.build(new URL('file:///foo/bar'))
      expect(storage.baseDir).toBe('/foo/bar')
    })

    it('should set the baseDir to the host and relative pathname of the url', async () => {
      const plugin = new FileSystemStoragePlugin({ createDirectoryIfNotExists: false })
      const storage = await plugin.build(new URL('file://../foo/bar'))
      expect(storage.baseDir).toBe(`${join(resolve(process.cwd(), '..'), 'foo', 'bar')}`)
    })

    it('should create the directory if createDirectoryIfNotExists is true(default)', async () => {
      const plugin = new FileSystemStoragePlugin()
      const mocked = vi.mocked(mkdir)
      await plugin.build(new URL('file:///foo/bar'))
      expect(mocked).toHaveBeenCalledWith('/foo/bar', { recursive: true })
    })

    it('should not create the directory if createDirectoryIfNotExists is false', async () => {
      const plugin = new FileSystemStoragePlugin({ createDirectoryIfNotExists: false })
      const mocked = vi.mocked(mkdir)
      await plugin.build(new URL('file:///foo/bar'))
      expect(mocked).not.toHaveBeenCalled()
    })
  })
})
