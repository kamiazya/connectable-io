import { ResourcePlugin } from '@pluggable-io/core'
import { MemoryStorageAdapter } from '../adapters/MemoryStorageAdapter.js'

export class MemoryStoragePlugin implements ResourcePlugin<MemoryStorageAdapter> {
  async build(url: URL) {
    return new MemoryStorageAdapter(url)
  }
}
