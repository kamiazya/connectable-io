import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryStorageAdapter } from './MemoryStorageAdapter.js'
import { FileNotExixtsError, OperationFailedError, PermissionDeniedError } from '@pluggable-io/storage'

import { ReadableStream, WritableStream } from '@pluggable-io/common'

beforeEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('MemoryStorageAdapter', () => {
  describe('exists method', () => {
    it('should return true if the file exists', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      expect(await storage.exists('foo')).toBe(true)
    })

    it('should return false if the file does not exist', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      expect(await storage.exists('bar')).toBe(false)
    })

    it('should throw PermissionDeniedError if the path is out of base directory', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await expect(storage.exists('../bar')).rejects.toThrow(PermissionDeniedError)
    })
  })

  describe('delete method', () => {
    it('should delete the file', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await storage.delete('foo')
      expect(await storage.exists('foo')).toBe(false)
    })

    it('should throw if the file does not exist', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await expect(storage.delete('bar')).rejects.toThrow()
    })

    it('should throw PermissionDeniedError if the path is out of base directory', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await expect(storage.delete('../bar')).rejects.toThrow(PermissionDeniedError)
    })

    it('should throw FileNotExixtsError if the file does not exist', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await expect(storage.delete('bar')).rejects.toThrow(FileNotExixtsError)
    })
  })

  describe('open method', () => {
    it('should throw PermissionDeniedError if the path is out of base directory', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await expect(storage.open('../bar')).rejects.toThrow(PermissionDeniedError)
    })

    describe('FileHandle', () => {
      it('should return a file handle', async () => {
        const storage = new MemoryStorageAdapter([['foo', 'bar']])
        const file = await storage.open('foo')
        expect(file.uri).toBe('memory://foo')
      })

      describe('createReadStream method', () => {
        it('should return a readable stream', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          const file = await storage.open('foo')
          const stream = await file.createReadStream()
          expect(stream).toBeInstanceOf(ReadableStream)
        })

        it('should throw PermissionDeniedError if the file is not readable', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          const file = await storage.open('foo', { read: false })
          await expect(file.createReadStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw FileNotExixtsError if the file does not exist', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          const file = await storage.open('bar')
          await expect(file.createReadStream()).rejects.toThrow(FileNotExixtsError)
        })

        it('should throw OperationFailedError if the operation is failed', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          vi.spyOn(storage, 'createReadStream').mockRejectedValue(new Error('test'))

          const file = await storage.open('foo')

          await expect(file.createReadStream()).rejects.toThrow(OperationFailedError)
        })
      })

      describe('createWriteStream method', () => {
        it('should return a writable stream', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          const file = await storage.open('foo', { write: true })
          const stream = await file.createWriteStream()
          expect(stream).toBeInstanceOf(WritableStream)
        })

        it('should throw PermissionDeniedError if the file is not writable', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          const file = await storage.open('foo', { write: false })
          await expect(file.createWriteStream()).rejects.toThrow(PermissionDeniedError)
        })

        it('should throw FileNotExixtsError if the file does not exist', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          const file = await storage.open('bar', { write: true })
          await expect(file.createWriteStream()).rejects.toThrow(FileNotExixtsError)
        })

        it('should throw OperationFailedError if the operation is failed', async () => {
          const storage = new MemoryStorageAdapter([['foo', 'bar']])
          vi.spyOn(storage, 'createWriteStream').mockRejectedValue(new Error('test'))

          const file = await storage.open('foo', { write: true })

          await expect(file.createWriteStream()).rejects.toThrow(OperationFailedError)
        })
      })
    })
  })

  describe('list method', () => {
    it('should return a list of files', async () => {
      const storage = new MemoryStorageAdapter([
        ['foo', 'bar'],
        ['baz', 'qux'],
      ])
      expect(await storage.list()).toEqual(['foo', 'baz'])
    })

    it('should return a list of files under the prefix', async () => {
      const storage = new MemoryStorageAdapter([
        ['foo', 'bar'],
        ['baz', 'qux'],
      ])
      expect(await storage.list('foo')).toEqual(['foo'])
    })

    it('should return a list of files under the prefix with glob pattern', async () => {
      const storage = new MemoryStorageAdapter([
        ['foo', 'bar'],
        ['baz', 'qux'],
      ])
      expect(await storage.list('*')).toEqual(['foo', 'baz'])
    })

    it('should return a list of files under the prefix with glob pattern', async () => {
      const storage = new MemoryStorageAdapter([
        ['foo', 'bar'],
        ['baz', 'qux'],
      ])
      expect(await storage.list('*.json')).toEqual([])
    })

    it('should throw PermissionDeniedError if the path is out of base directory', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])
      await expect(storage.list('../bar')).rejects.toThrow(PermissionDeniedError)
    })

    it('should thow OperationFailedError if the operation is failed', async () => {
      const storage = new MemoryStorageAdapter([['foo', 'bar']])

      const mock = vi.spyOn(storage, '_list')
      mock.mockRejectedValue(new Error('test'))

      await expect(storage.list('bar')).rejects.toThrow(OperationFailedError)
    })
  })
})
