import { Storage } from '@connectable-io/storage'

Storage.addDynamicPluginLoader('gs:', async () => {
  await import('@connectable-io/storage-plugin-gs/pnp')
})
