import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { TmpStorageAdapter } from './TmpStorageAdapter.js'

describe('TmpStorageAdapter', () => {
  describe('constructor', () => {
    it('should use the default base directory', () => {
      const storage = new TmpStorageAdapter()
      expect(storage.url.pathname).toBe(tmpdir())
    })
    it('should use the default url schema', () => {
      const storage = new TmpStorageAdapter()
      expect(storage.url.protocol).toBe('tmp:')
    })
    it('should resolve relative paths', () => {
      const storage = new TmpStorageAdapter({ baseDir: 'foo' })
      expect(storage.url.pathname).toBe(join(tmpdir(), 'foo'))
    })
    it('should use absolute paths as is', () => {
      const storage = new TmpStorageAdapter({ baseDir: '/foo' })
      expect(storage.url.pathname).toBe('/foo')
    })
  })
})
