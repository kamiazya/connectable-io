import { describe, it, expect, vi, afterEach } from 'vitest'
import { FileSystemStorageAdapter } from './FileSystemStorageAdapter.js'
import { lstat, readdir, rm } from 'node:fs/promises'

vi.mock('node:fs/promises')

import { join } from 'node:path'
import { FileNotExixtsError, PermissionDeniedError } from '@pluggable-io/storage'

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('FileSystemStorageAdapter', () => {
  describe('constructor', () => {
    it('should use the default base directory', () => {
      const storage = new FileSystemStorageAdapter()
      expect(storage.url.pathname).toBe(process.cwd())
    })
    it('should use the default url schema', () => {
      const storage = new FileSystemStorageAdapter()
      expect(storage.url.protocol).toBe('file:')
    })
    it('should resolve relative paths', () => {
      const storage = new FileSystemStorageAdapter({ baseDir: 'foo' })
      expect(storage.url.pathname).toBe(join(process.cwd(), 'foo'))
    })
    it('should use absolute paths as is', () => {
      const storage = new FileSystemStorageAdapter({ baseDir: '/foo' })
      expect(storage.url.pathname).toBe('/foo')
    })

    it.each(['fs:', 'test-fs:', 'any:'])(`should use the url schema "%s"`, (urlSchema) => {
      const storage = new FileSystemStorageAdapter({ urlSchema, baseDir: 'foo' })
      expect(storage.url.protocol).toBe(urlSchema)
    })
  })
  describe('exists', () => {
    it('should return true if the file exists', async () => {
      vi.mocked(lstat).mockImplementation(() => Promise.resolve({} as any))

      const storage = new FileSystemStorageAdapter()

      expect(await storage.exists('exists-file')).toBe(true)
    })

    it('should return false if the file does not exist', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(lstat).mockRejectedValue(new Error('File not found'))
      expect(await storage.exists('bar')).toBe(false)
    })

    it('should throw if the file is out of the base directory', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: 'foo' })
      await expect(storage.exists('../bar')).rejects.toThrow(PermissionDeniedError)
    })
  })

  describe('delete', () => {
    it('should delete the file', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(lstat).mockResolvedValueOnce({} as any)
      vi.mocked(rm).mockResolvedValueOnce(undefined)
      await storage.delete('foo')
      expect(rm).toHaveBeenCalledWith(join(process.cwd(), 'foo'))
    })
    it('should throw if the file does not exist', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(lstat).mockRejectedValue(new Error('File not found'))
      await expect(storage.delete('bar')).rejects.toThrow(FileNotExixtsError)
    })

    it('should throw if the file is out of the base directory', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: 'foo' })
      await expect(storage.delete('../bar')).rejects.toThrow(PermissionDeniedError)
    })
  })

  describe('list', () => {
    it('should list the files', async () => {
      const storage = new FileSystemStorageAdapter()
      const expected = ['foo', 'bar']
      vi.mocked(readdir).mockResolvedValueOnce(expected as any)
      expect(await storage.list()).toEqual(expected)
      expect(readdir).toHaveBeenCalledWith(process.cwd())
    })
  })

  describe('open', () => {
    it('should throw if the file is out of the base directory', async () => {
      const storage = new FileSystemStorageAdapter({ baseDir: 'foo' })
      await expect(storage.open('../bar')).rejects.toThrow(PermissionDeniedError)
    })
  })
})
