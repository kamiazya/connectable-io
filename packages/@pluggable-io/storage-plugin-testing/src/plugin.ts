import { ResourcePlugin } from '@pluggable-io/core'
import { MemoryStorageAdapter } from './memory.js'

export class MemoryStoragePlugin implements ResourcePlugin<MemoryStorageAdapter> {
  async build(url: URL) {
    return new MemoryStorageAdapter(url)
  }
}
