import { Storage } from '@connectable-io/storage'
import { Logger } from '@connectable-io/logger'

Storage.addDynamicPluginLoader('memory:', async () => {
  await import('@connectable-io/storage-plugin-memory/pnp')
})
Logger.addDynamicPluginLoader('null:', async () => {
  await import('@connectable-io/logger-plugin-null/pnp')
})
Logger.addDynamicPluginLoader('memory:', async () => {
  await import('@connectable-io/logger-plugin-memory/pnp')
})
