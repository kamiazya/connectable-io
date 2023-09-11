import { Storage } from '@pluggable-io/storage'

Storage.addDynamicPluginLoader('gs:', async () => {
  await import('@pluggable-io/storage-plugin-gs/pnp')
})
