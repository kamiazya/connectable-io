import { Storage } from '@pluggable-io/storage'
import { Logger } from '@pluggable-io/logger'

Storage.addDynamicPluginLoader('memory:', async () => {
  await import('@pluggable-io/storage-plugin-memory/pnp')
})
Logger.addDynamicPluginLoader('null:', async () => {
  await import('@pluggable-io/logger-plugin-null/pnp')
})
Logger.addDynamicPluginLoader('memory:', async () => {
  await import('@pluggable-io/logger-plugin-memory/pnp')
})
