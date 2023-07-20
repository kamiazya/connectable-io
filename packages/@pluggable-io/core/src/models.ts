import { PluginAlreadyRegisteredError, PluginNotRegisteredError, Registory, ResourcePlugin } from './types.js'

/**
 * A registry for resources.
 *
 * @todo Add caching mechanism for instances
 */
export class RegistoryBase<T> implements Registory<T> {
  plugins = new Map<string, ResourcePlugin<T>>()

  registerPlugin(protocol: string, plugin: ResourcePlugin<T>) {
    if (this.plugins.has(protocol))
      throw new PluginAlreadyRegisteredError(`Plugin for protocol "${protocol}" already registered`)
    this.plugins.set(protocol, plugin)
  }

  async from(url: string): Promise<T> {
    const url_ = new URL(url)
    const plugin = this.plugins.get(url_.protocol)
    if (!plugin) throw new PluginNotRegisteredError(`No plugin registered for protocol "${url_.protocol}"`)
    return plugin.build(url_)
  }
}
