import { Storage } from '@pluggable-io/storage'
import { Logger } from '@pluggable-io/logger'

/**
 * @beta This API is in beta and may change between minor versions.
 */
export const PLUG_AND_PLAY = Object.freeze({
  STORAGE: Object.freeze({
    'file:': () => import('@pluggable-io/storage-plugin-file/pnp'),
  }),
  LOGGER: Object.freeze({
    'console:': () => import('@pluggable-io/logger-plugin-console/pnp'),
  }),
})

for (const [protocol, plugin] of Object.entries(PLUG_AND_PLAY.STORAGE)) {
  Storage.PLUGIN_PLUG_AND_PLAY[protocol] = plugin
}
for (const [protocol, plugin] of Object.entries(PLUG_AND_PLAY.LOGGER)) {
  Logger.PLUGIN_PLUG_AND_PLAY[protocol] = plugin
}
