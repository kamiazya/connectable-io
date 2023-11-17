import { ResourcePlugin } from '@connectable-io/core'
import { MemoryStorageAdapter } from '../adapters/MemoryStorageAdapter.js'

export class MemoryStoragePlugin implements ResourcePlugin<MemoryStorageAdapter> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async build(_url: string) {
    return new MemoryStorageAdapter()
  }
}
