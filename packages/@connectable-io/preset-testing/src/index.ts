import { Storage } from '@connectable-io/storage'
import { Logger } from '@connectable-io/logger'

Storage.addDynamicPluginLoader({
  pattern: {
    protocol: 'memory',
  },
  async load() {
    await import('@connectable-io/storage-plugin-memory/pnp')
  },
})
Logger.addDynamicPluginLoader({
  pattern: {
    protocol: 'null',
  },
  async load() {
    await import('@connectable-io/logger-plugin-null/pnp')
  },
})
Logger.addDynamicPluginLoader({
  pattern: {
    protocol: 'memory',
  },
  async load() {
    await import('@connectable-io/logger-plugin-memory/pnp')
  },
})
