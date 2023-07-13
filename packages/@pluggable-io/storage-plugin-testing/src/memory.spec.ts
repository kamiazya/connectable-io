import { describe, expect, it } from 'vitest';
import { MemoryStorageAdapter } from './memory.js';

describe('MemoryStorageAdapter', () => {
  const url = new URL('memory://')
  describe('exists', () => {
    it('should return true if the file exists', async () => {
      const storage = new MemoryStorageAdapter(url, [['foo', 'bar']])
      expect(await storage.exists('foo')).toBe(true)
    })
    it('should return false if the file does not exist', async () => {
      const storage = new MemoryStorageAdapter(url, [['foo', 'bar']])
      expect(await storage.exists('bar')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete the file', async () => {
      const storage = new MemoryStorageAdapter(url, [['foo', 'bar']])
      await storage.delete('foo')
      expect(await storage.exists('foo')).toBe(false)
    })
    it('should throw if the file does not exist', async () => {
      const storage = new MemoryStorageAdapter(url, [['foo', 'bar']])
      await expect(storage.delete('bar')).rejects.toThrow()
    })
  })

})
