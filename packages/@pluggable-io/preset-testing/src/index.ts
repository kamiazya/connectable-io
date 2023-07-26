import { Storage } from '@pluggable-io/storage'
import { Logger } from '@pluggable-io/logger'

/**
 * @beta This API is in beta and may change between minor versions.
 */
export const PLUG_AND_PLAY = Object.freeze({
  STORAGE: Object.freeze({
    'memory:': () => import('@pluggable-io/storage-plugin-memory/pnp'),
  }),
  LOGGER: Object.freeze({
    'null:': () => import('@pluggable-io/logger-plugin-null/pnp'),
    'memory:': () => import('@pluggable-io/logger-plugin-memory/pnp'),
  }),
})

for (const [protocol, plugin] of Object.entries(PLUG_AND_PLAY.STORAGE)) {
  Storage.PLUGIN_PLUG_AND_PLAY[protocol] = plugin
}
for (const [protocol, plugin] of Object.entries(PLUG_AND_PLAY.LOGGER)) {
  Logger.PLUGIN_PLUG_AND_PLAY[protocol] = plugin
}
