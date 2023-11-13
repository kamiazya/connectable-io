import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { FileSystemStorageAdapter } from './FileSystemStorageAdapter.js'
import { access, lstat, open, readdir, rm, mkdir } from 'node:fs/promises'

vi.mock('node:fs/promises')
vi.mock('glob')

import { join } from 'node:path'
import { PassThrough, Readable } from 'node:stream'
import { FileNotExistsError, OperationFailedError, PermissionDeniedError } from '@pluggable-io/storage'
import { ReadableStream, WritableStream } from '@pluggable-io/common'
import { glob } from 'glob'

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

    it('should use the default mode', () => {
      const storage = new FileSystemStorageAdapter()
      expect(storage.mode).toBe(0o666)
    })

    it('should use the given mode', () => {
      const storage = new FileSystemStorageAdapter({ mode: 0o777 })
      expect(storage.mode).toBe(0o777)
    })

    it('should use the default options', () => {
      const storage = new FileSystemStorageAdapter()
      expect(storage.read).toBe(true)
      expect(storage.write).toBe(false)
      expect(storage.create).toBe(false)
    })

    it('should use the given options', () => {
      const storage = new FileSystemStorageAdapter({ read: false, write: true, create: true })
      expect(storage.read).toBe(false)
      expect(storage.write).toBe(true)
      expect(storage.create).toBe(true)
    })

    it('should use the default createDirectoryIfNotExists', () => {
      const storage = new FileSystemStorageAdapter()
      expect(storage.createDirectoryIfNotExists).toBe(true)
    })

    it('should use the given createDirectoryIfNotExists', () => {
      const storage = new FileSystemStorageAdapter({ createDirectoryIfNotExists: false })
      expect(storage.createDirectoryIfNotExists).toBe(false)
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
      expect(rm).toHaveBeenCalledWith(join(storage.baseDir, 'foo'))
    })
    it('should throw if the file does not exist', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(lstat).mockRejectedValue(new Error('File not found'))
      await expect(storage.delete('bar')).rejects.toThrow(FileNotExistsError)
    })

    it('should throw if the file is out of the base directory', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: 'foo' })
      await expect(storage.delete('../bar')).rejects.toThrow(PermissionDeniedError)
    })

    it('should throw OperationFailedError if delete failed', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(lstat).mockResolvedValueOnce({} as any)
      vi.mocked(rm).mockRejectedValueOnce(new Error('Failed to delete'))
      await expect(storage.delete('foo')).rejects.toThrow(OperationFailedError)
    })
  })

  describe('list method', () => {
    it('should list the files in the baseDir', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(glob).mockResolvedValue([
        {
          isDirectory: () => false,
          fullpath: () => join(process.cwd(), 'foo'),
        },
        {
          isDirectory: () => true,
          fullpath: () => join(process.cwd(), 'bar'),
        },
      ] as any[])
      expect(await storage.list()).toEqual(['foo', 'bar/'])
      expect(glob).toHaveBeenCalledWith('*', {
        cwd: storage.baseDir,
        withFileTypes: true,
      })
    })

    it('should list the files with prefix', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(glob).mockResolvedValueOnce([
        {
          isDirectory: () => false,
          fullpath: () => join(process.cwd(), 'baz/foo'),
        },
        {
          isDirectory: () => true,
          fullpath: () => join(process.cwd(), 'baz/bar'),
        },
      ] as any[])

      expect(await storage.list('baz')).toEqual(['baz/foo', 'baz/bar/'])
      expect(glob).toHaveBeenCalledWith('baz', {
        cwd: storage.baseDir,
        withFileTypes: true,
      })
    })

    it('should throw if the directory is out of the base directory', async () => {
      const storage = new FileSystemStorageAdapter({ urlSchema: 'fs', baseDir: 'foo' })
      await expect(storage.list('../bar')).rejects.toThrow(PermissionDeniedError)
    })

    it('should throw OperationFailedError if list failed', async () => {
      const storage = new FileSystemStorageAdapter()
      vi.mocked(access).mockResolvedValueOnce(undefined)
      vi.mocked(readdir).mockRejectedValueOnce(new Error('Failed to list'))
      await expect(storage.list()).rejects.toThrow(OperationFailedError)
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
        const handle = await storage.open('bar')
        expect(handle.uri).toBe(`file://${storage.baseDir}/bar`)
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
          vi.spyOn(storage, '_exists' as any).mockResolvedValue(true)

          const handle = await storage.open('bar')
          const stream = await handle.createReadStream()
          expect(stream).toBeInstanceOf(ReadableStream)
        })

        it('should open the file with read permission', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)

          const handle = await storage.open('bar')
          await handle.createReadStream()

          expect(open).toHaveBeenCalledWith(join(storage.baseDir, 'bar'), 'r')
        })

        it('should throw PermissionDeniedError without read permission on file', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)
          vi.mocked(access).mockRejectedValueOnce(new Error('Permission denied'))

          const handle = await storage.open('bar', { read: true })
          await expect(handle.createReadStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw FileNotExistsError if the file does not exist', async () => {
          const storage = new FileSystemStorageAdapter()
          const handle = await storage.open('bar')
          await expect(handle.createReadStream()).rejects.toThrow(FileNotExistsError)
        })

        it('should throw PermissionDeniedError if open without read permission', async () => {
          const storage = new FileSystemStorageAdapter()
          const handle = await storage.open('bar', { read: false })
          await expect(handle.createReadStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw OperationFailedError if open failed', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(true)
          vi.mocked(open).mockRejectedValueOnce(new Error('Failed to open'))

          const handle = await storage.open('bar')
          await expect(handle.createReadStream()).rejects.toThrow(OperationFailedError)
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
          vi.spyOn(storage, '_exists' as any).mockResolvedValue(true)
          const handle = await storage.open('bar', { write: true, create: true })
          const stream = await handle.createWriteStream()
          expect(stream).toBeInstanceOf(WritableStream)
        })

        it('should throw PermissionDeniedError if open without write permission', async () => {
          const storage = new FileSystemStorageAdapter()
          const handle = await storage.open('bar', { write: false })
          await expect(handle.createWriteStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw PermissionDeniedError without write permission on file', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValue(true)
          vi.mocked(access).mockRejectedValueOnce(new Error('Permission denied'))

          const handle = await storage.open('bar', { write: true })
          await expect(handle.createWriteStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should open the file with write and create permission', async () => {
          const storage = new FileSystemStorageAdapter()
          const handle = await storage.open('bar', { create: true, write: true })
          await handle.createWriteStream()
          expect(open).toHaveBeenCalledWith(join(storage.baseDir, 'bar'), 'w', 0o666)
        })

        it('should open the file with given mode', async () => {
          const storage = new FileSystemStorageAdapter({ mode: 0o777 })
          const handle = await storage.open('bar', { create: true, write: true })
          await handle.createWriteStream()
          expect(open).toHaveBeenCalledWith(join(storage.baseDir, 'bar'), 'w', 0o777)
        })

        it('should throw FileNotExistsError if the file exists and create is false', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(false)
          const handle = await storage.open('bar', { write: true, create: false })
          await expect(handle.createWriteStream()).rejects.toThrow(FileNotExistsError)
        })

        it('should throw OperationFailedError if open failed', async () => {
          const storage = new FileSystemStorageAdapter()
          vi.spyOn(storage, '_exists' as any).mockResolvedValue(true)
          vi.mocked(open).mockRejectedValueOnce(new Error('Failed to open'))

          const handle = await storage.open('bar', { write: true })
          await expect(handle.createWriteStream()).rejects.toThrow(OperationFailedError)
        })

        it('should create the directory if createDirectoryIfNotExists is true', async () => {
          const storage = new FileSystemStorageAdapter({ createDirectoryIfNotExists: true })
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(false)
          vi.mocked(mkdir).mockResolvedValueOnce(undefined)

          const handle = await storage.open('bar', { write: true, create: true })
          await handle.createWriteStream()
          expect(mkdir).toHaveBeenCalledWith(join(storage.baseDir), { recursive: true })
        })

        it('should not create the directory if createDirectoryIfNotExists is false', async () => {
          const storage = new FileSystemStorageAdapter({ createDirectoryIfNotExists: false })
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(false)
          vi.mocked(mkdir).mockResolvedValueOnce(undefined)

          const handle = await storage.open('bar', { write: true, create: true })
          await handle.createWriteStream()
          expect(mkdir).not.toHaveBeenCalled()
        })

        it('should throw OperationFailedError if create directory failed', async () => {
          const storage = new FileSystemStorageAdapter({ createDirectoryIfNotExists: true })
          vi.spyOn(storage, '_exists' as any).mockResolvedValueOnce(false)
          vi.mocked(mkdir).mockRejectedValueOnce(new Error('Failed to create directory'))

          const handle = await storage.open('bar', { write: true, create: true })
          await expect(handle.createWriteStream()).rejects.toThrow(OperationFailedError)
        })
      })
    })
  })
})
