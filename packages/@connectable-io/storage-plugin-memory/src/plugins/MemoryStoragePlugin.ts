import { ResourcePlugin } from '@connectable-io/core'
import { MemoryStorageAdapter } from '../adapters/MemoryStorageAdapter.js'

export class MemoryStoragePlugin implements ResourcePlugin<MemoryStorageAdapter> {
  async build(_url: string) {
    return new MemoryStorageAdapter()
  }
}
