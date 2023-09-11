import { PluginAlreadyLoadedError, PluginNotLoadedError, Registory, ResourcePlugin } from './types.js'

/**
 * A registry for resources.
 *
 * @todo Add caching mechanism for instances
 */
export class RegistoryBase<T> implements Registory<T> {
  PLUGIN_PLUG_AND_PLAY: Record<string, () => Promise<any>> = {}

  plugins = new Map<string, ResourcePlugin<T>>()

  load(protocol: string, plugin: ResourcePlugin<T>) {
    if (this.plugins.has(protocol))
      throw new PluginAlreadyLoadedError(`Plugin for protocol "${protocol}" already loaded`)
    this.plugins.set(protocol, plugin)
  }

  async _from(url: URL): Promise<T> {
    const plugin = this.plugins.get(url.protocol)
    if (!plugin) throw new PluginNotLoadedError(`No plugin loaded for protocol "${url.protocol}"`)
    return plugin.build(url)
  }

  async from(url: string): Promise<T> {
    const url_ = new URL(url)
    try {
      return await this._from(url_)
    } catch (error) {
      if (error instanceof PluginNotLoadedError) {
        if (url_.protocol in this.PLUGIN_PLUG_AND_PLAY) {
          try {
            await this.PLUGIN_PLUG_AND_PLAY[url_.protocol]()
          } catch (error2) {
            delete this.PLUGIN_PLUG_AND_PLAY[url_.protocol]
            this.plugins.delete(url_.protocol)
            new PluginNotLoadedError(`Tried Plug and Play for "${url_.protocol}", but it failed.`, {
              cause: new AggregateError([error, error2]),
            })
          }
          return await this._from(url_)
        }
      }
      throw error
    }
  }
}
