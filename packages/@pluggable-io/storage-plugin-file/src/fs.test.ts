import { describe, it, expect, vi, afterEach } from 'vitest'
import { FileSystemStorageAdapter } from './fs.js'
import { lstat, readdir, rm } from 'node:fs/promises'

vi.mock('node:fs/promises')

import { join } from 'node:path'
import { FileNotExixtsError } from '@pluggable-io/storage'

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('FileSystemStorageAdapter', () => {
  describe('constructor', () => {
    it('should resolve relative paths', () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: 'foo' })
      expect(storage.url.pathname).toBe(join(process.cwd(), 'foo'))
    })
    it('should use absolute paths as is', () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: '/foo' })
      expect(storage.url.pathname).toBe('/foo')
    })
    it('should use the url schema', () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'test-fs', baseDir: 'foo' })
      expect(storage.url.protocol).toBe('test-fs:')
    })
  })
  describe('exists', () => {
    it('should return true if the file exists', async () => {
      vi.mocked(lstat).mockImplementation(() => Promise.resolve({} as any))

      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs' })

      expect(await storage.exists('exists-file')).toBe(true)
    })

    it('should return false if the file does not exist', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs' })
      vi.mocked(lstat).mockRejectedValue(new Error('File not found'))
      expect(await storage.exists('bar')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete the file', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs' })
      vi.mocked(lstat).mockResolvedValueOnce({} as any)
      vi.mocked(rm).mockResolvedValueOnce(undefined)
      await storage.delete('foo')
      expect(rm).toHaveBeenCalledWith(join(process.cwd(), 'foo'))
    })
    it('should throw if the file does not exist', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs' })
      vi.mocked(lstat).mockRejectedValue(new Error('File not found'))
      await expect(storage.delete('bar')).rejects.toThrow(FileNotExixtsError)
    })
  })

  describe('list', () => {
    it('should list the files', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs' })
      const expected = ['foo', 'bar']
      vi.mocked(readdir).mockResolvedValueOnce(expected as any)
      expect(await storage.list()).toEqual(expected)
      expect(readdir).toHaveBeenCalledWith(process.cwd())
    })
  })
})
