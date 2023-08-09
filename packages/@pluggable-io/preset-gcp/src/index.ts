import { Storage } from '@pluggable-io/storage'

/**
 * @beta This API is in beta and may change between minor versions.
 */
export const PLUG_AND_PLAY = Object.freeze({
  STORAGE: Object.freeze({
    'gs:': () => import('@pluggable-io/storage-plugin-gs/pnp'),
  }),
})

for (const [protocol, plugin] of Object.entries(PLUG_AND_PLAY.STORAGE)) {
  Storage.PLUGIN_PLUG_AND_PLAY[protocol] = plugin
}
