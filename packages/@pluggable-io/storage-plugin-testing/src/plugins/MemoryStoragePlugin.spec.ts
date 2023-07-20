import { describe, expect, it } from 'vitest'
import { MemoryStoragePlugin } from './MemoryStoragePlugin.js'
import { MemoryStorageAdapter } from '../adapters/MemoryStorageAdapter.js'

describe('FileSystemStoragePlugin', () => {
  describe('build', () => {
    it('should return a MemoryStorageAdapter', async () => {
      const plugin = new MemoryStoragePlugin()
      const storage = await plugin.build(new URL('memory:'))
      expect(storage).toBeInstanceOf(MemoryStorageAdapter)
    })
  })
})
