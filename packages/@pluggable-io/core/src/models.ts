/// <reference types="urlpattern-polyfill" />
import {
  DynamicPluginLoader,
  PluginAlreadyLoadedError,
  PluginNotLoadedError,
  Registory,
  ResourceBuildError,
  ResourcePlugin,
} from './types.js'

/**
 * A registry for resources.
 *
 * @todo Add caching mechanism for instances
 */
export class RegistoryBase<T> implements Registory<T> {
  dynamicLoaders: [pattern: string, loader: DynamicPluginLoader][] = []

  plugins = new Map<string, ResourcePlugin<T>>()

  addDynamicPluginLoader(pattern: string, loader: DynamicPluginLoader) {
    this.dynamicLoaders.push([pattern, loader])
  }

  async dynamicPluginLoad(url: URL) {
    for (const [protocol, loader] of this.dynamicLoaders) {
      const pattern = new URLPattern({ protocol })
      if (pattern.test(url)) {
        const input = pattern.exec(url)
        await loader(
          input?.protocol ?? {
            input: url.protocol,
            groups: {},
          },
        )
        return
      }
    }
  }

  load(protocol: string, plugin: ResourcePlugin<T>) {
    if (this.plugins.has(protocol))
      throw new PluginAlreadyLoadedError(`Plugin for protocol "${protocol}" already loaded`)
    this.plugins.set(protocol, plugin)
  }

  async _from(url: URL): Promise<T> {
    const plugin = this.plugins.get(url.protocol)
    if (!plugin) throw new PluginNotLoadedError(`No plugin loaded for protocol "${url.protocol}"`)
    try {
      return await plugin.build(url)
    } catch (error) {
      throw new ResourceBuildError(`Failed to build resource from "${url}"`, {
        cause: error,
      })
    }
  }

  async from(url: string): Promise<T> {
    const url_ = new URL(url)
    try {
      return await this._from(url_)
    } catch (error) {
      if (error instanceof PluginNotLoadedError) {
        try {
          await this.dynamicPluginLoad(url_)
          return await this._from(url_)
        } catch (error2) {
          this.plugins.delete(url_.protocol)
          throw new PluginNotLoadedError(`Tried dynamic load for "${url_.protocol}", but it failed.`, {
            cause: new AggregateError([error, error2]),
          })
        }
      }
      throw error
    }
  }
}
