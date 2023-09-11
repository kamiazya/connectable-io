import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { FileSystemStorageAdapter } from './FileSystemStorageAdapter.js'
import { access, lstat, open, readdir, rm } from 'node:fs/promises'

vi.mock('node:fs/promises')

import { join } from 'node:path'
import { PassThrough, Readable } from 'node:stream'
import { FileNotExixtsError, PermissionDeniedError } from '@pluggable-io/storage'
import { ReadableStream, WritableStream } from '@pluggable-io/common'

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
  describe('exists method', () => {
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

  describe('delete method', () => {
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

  describe('list method', () => {
    it('should list the files', async () => {
      const storage = new FileSystemStorageAdapter()
      const expected = ['foo', 'bar']
      vi.mocked(readdir).mockResolvedValueOnce(expected as any)
      expect(await storage.list()).toEqual(expected)
      expect(readdir).toHaveBeenCalledWith(process.cwd())
    })
  })

  describe('open method', () => {
    it('should throw if the file is out of the base directory', async () => {
      const storage = new FileSystemStorageAdapter()
      await expect(storage.open('../bar')).rejects.toThrow(PermissionDeniedError)
    })

    describe('FileHandle', () => {
      it('should return the uri', async () => {
        const storage = new FileSystemStorageAdapter()
        const hundle = await storage.open('bar')
        expect(hundle.uri.href).toBe(`file://${process.cwd()}/bar`)
      })

      describe('createReadStream method', () => {
        beforeEach(() => {
          vi.mocked(open).mockImplementation(() =>
            Promise.resolve({
              createReadStream: () => Readable.from('foo'),
            } as any),
          )
        })

        it('should return a readable stream', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)

          const hundle = await storage.open('bar')
          const stream = await hundle.createReadStream()
          expect(stream).toBeInstanceOf(ReadableStream)
        })

        it('should open the file with read permission', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)

          const hundle = await storage.open('bar')
          await hundle.createReadStream()

          expect(open).toHaveBeenCalledWith(join(process.cwd(), 'bar'), 'r')
        })

        it('should throw PermissionDeniedError without read permission on file', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)
          vi.mocked(access).mockRejectedValueOnce(new Error('Permission denied'))

          const hundle = await storage.open('bar', { read: true })
          await expect(hundle.createReadStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw if the file does not exist', async () => {
          const storage = new FileSystemStorageAdapter()
          const hundle = await storage.open('bar')
          await expect(hundle.createReadStream()).rejects.toThrow(FileNotExixtsError)
        })

        it('should throw if open without read permission', async () => {
          const storage = new FileSystemStorageAdapter()
          const hundle = await storage.open('bar', { read: false })
          await expect(hundle.createReadStream()).rejects.toThrow(PermissionDeniedError)
        })
      })

      describe('createWriteStream method', () => {
        beforeEach(() => {
          vi.mocked(open).mockImplementation(() =>
            Promise.resolve({
              createWriteStream: () => new PassThrough(),
            } as any),
          )
        })
        it('should return a writable stream', async () => {
          const storage = new FileSystemStorageAdapter()
          const hundle = await storage.open('bar')
          const stream = await hundle.createWriteStream()
          expect(stream).toBeInstanceOf(WritableStream)
        })

        it('should throw PermissionDeniedError if open without write permission', async () => {
          const storage = new FileSystemStorageAdapter()
          const hundle = await storage.open('bar', { write: false })
          await expect(hundle.createWriteStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw PermissionDeniedError without write permission on file', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)
          vi.mocked(access).mockRejectedValueOnce(new Error('Permission denied'))

          const hundle = await storage.open('bar', { write: true })
          await expect(hundle.createWriteStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should open the file with write and create permission', async () => {
          const storage = new FileSystemStorageAdapter()
          const hundle = await storage.open('bar', { create: true, write: true })
          await hundle.createWriteStream()
          expect(open).toHaveBeenCalledWith(join(process.cwd(), 'bar'), 'w', 0o666)
        })

        it('should open the file with given mode', async () => {
          const storage = new FileSystemStorageAdapter({ mode: 0o777 })
          const hundle = await storage.open('bar', { create: true, write: true })
          await hundle.createWriteStream()
          expect(open).toHaveBeenCalledWith(join(process.cwd(), 'bar'), 'w', 0o777)
        })

        it('should throw FileNotExixtsError if the file exists and create is false', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(false)
          const hundle = await storage.open('bar', { create: false })
          await expect(hundle.createWriteStream()).rejects.toThrow(FileNotExixtsError)
        })
      })
    })
  })
})
