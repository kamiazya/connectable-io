import { Storage } from '@connectable-io/storage'

Storage.addDynamicPluginLoader({
  pattern: {
    protocol: 'gs',
  },
  async load() {
    await import('@connectable-io/storage-plugin-gs/pnp')
  },
})
