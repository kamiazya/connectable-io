import { Storage } from '@pluggable-io/storage'
import { Logger } from '@pluggable-io/logger'

Storage.addDynamicPluginLoader('file:', async () => {
  await import('@pluggable-io/storage-plugin-file/pnp')
})
Logger.addDynamicPluginLoader('console:', async () => {
  await import('@pluggable-io/logger-plugin-console/pnp')
})
