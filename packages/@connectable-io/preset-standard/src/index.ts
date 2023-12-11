import { Storage } from '@connectable-io/storage'
// import { Logger } from '@connectable-io/logger'

Storage.addDynamicPluginLoader('file:', async () => {
  await import('@connectable-io/storage-plugin-file/pnp')
})
// Logger.addDynamicPluginLoader('console:', async () => {
//   await import('@connectable-io/logger-plugin-console/pnp')
// })
