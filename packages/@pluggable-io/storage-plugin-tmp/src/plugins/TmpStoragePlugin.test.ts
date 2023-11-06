import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TmpStoragePlugin } from './TmpStoragePlugin.js'
import { join, resolve } from 'node:path'
import { TmpStorageAdapter } from '../adapters/TmpStorageAdapter.js'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { webcrypto } from 'node:crypto'

vi.mock('node:fs/promises')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('TmpStoragePlugin', () => {
  describe('constructor', () => {
    describe('baseDir option', () => {
      describe('when given an absolute path', () => {
        it('should set baseDir', () => {
          const plugin = new TmpStoragePlugin({
            baseDir: '/foo',
          })
          expect(plugin.baseDir).toBe('/foo')
        })
      })
      describe('when given a relative path', () => {
        it('should set baseDir', () => {
          const plugin = new TmpStoragePlugin({
            baseDir: 'foo',
          })
          expect(plugin.baseDir).toBe(join(tmpdir(), 'foo'))
        })
      })

      it('should set the baseDir to os.tmpdir() by default', () => {
        const plugin = new TmpStoragePlugin()
        expect(plugin.baseDir).toBe(tmpdir())
      })
    })

    describe('createDirectoryIfNotExists option', () => {
      it('should set createDirectoryIfNotExists', () => {
        const plugin = new TmpStoragePlugin({
          createDirectoryIfNotExists: true,
        })
        expect(plugin.createDirectoryIfNotExists).toBe(true)
      })

      it('should set createDirectoryIfNotExists to true by default', () => {
        const plugin = new TmpStoragePlugin()
        expect(plugin.createDirectoryIfNotExists).toBe(true)
      })
    })
  })

  describe('build', () => {
    it('should return a TmpStorageAdapter', async () => {
      const plugin = new TmpStoragePlugin()
      const storage = await plugin.build(new URL('tmp://'))
      expect(storage).toBeInstanceOf(TmpStorageAdapter)
    })

    it('should set the urlSchema to the protocol of the url', async () => {
      const plugin = new TmpStoragePlugin()
      const storage = await plugin.build(new URL('tmp://'))
      expect(storage.urlSchema).toBe('tmp:')
    })

    it('should set the baseDir to the host and absolute pathname of the url', async () => {
      const plugin = new TmpStoragePlugin({ createDirectoryIfNotExists: false })
      const storage = await plugin.build(new URL('tmp:///foo/bar'))
      expect(storage.baseDir).toBe('/foo/bar')
    })

    it('should set the baseDir to the host and relative pathname of the url', async () => {
      const plugin = new TmpStoragePlugin({ createDirectoryIfNotExists: false })
      const storage = await plugin.build(new URL('tmp://../foo/bar'))
      expect(storage.baseDir).toBe(`${join(resolve(tmpdir(), '..'), 'foo', 'bar')}`)
    })

    it('if you do not set a pathname, uuid as pathname', async () => {
      const uuid = webcrypto.randomUUID()
      vi.spyOn(webcrypto, 'randomUUID').mockImplementation(() => uuid)
      const plugin = new TmpStoragePlugin({ createDirectoryIfNotExists: false })
      const storage = await plugin.build(new URL('tmp://'))
      expect(storage.baseDir).toBe(`${tmpdir()}/${uuid}`)
    })

    it('should create the directory if createDirectoryIfNotExists is true(default)', async () => {
      const plugin = new TmpStoragePlugin()
      const mocked = vi.mocked(mkdir)
      await plugin.build(new URL('tmp:///foo/bar'))
      expect(mocked).toHaveBeenCalledWith('/foo/bar', { recursive: true })
    })

    it('should not create the directory if createDirectoryIfNotExists is false', async () => {
      const plugin = new TmpStoragePlugin({ createDirectoryIfNotExists: false })
      const mocked = vi.mocked(mkdir)
      await plugin.build(new URL('tmp:///foo/bar'))
      expect(mocked).not.toHaveBeenCalled()
    })
  })
})
