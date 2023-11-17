import { Channel, channel } from 'node:diagnostics_channel'
import {
  DynamicPluginLoader,
  PluginAlreadyLoadedError,
  PluginNotLoadedError,
  Registry,
  ResourcePlugin,
} from '../types.js'

export abstract class RegistryBase<Resource, Options extends readonly any[], Pattern = string>
  implements Registry<Resource, Options, Pattern>
{
  dc: Readonly<{
    onPluginLoaded: Channel
    onDynamicPluginLoaderAdded: Channel
  }>
  dynamicLoaders: [pattern: Pattern, loader: DynamicPluginLoader][] = []

  plugins = new Map<string, ResourcePlugin<Resource, Options>>()

  /**
   * Create a new registry.
   *
   * @param name Resource name of the registry.
   */
  constructor(name: string) {
    this.dc = {
      onPluginLoaded: channel(`connectable-io.${name}:onPluginLoaded`),
      onDynamicPluginLoaderAdded: channel(`connectable-io.${name}:onDynamicPluginLoaderAdded`),
    }
  }

  addDynamicPluginLoader<Keys extends string>(pattern: Pattern, loader: DynamicPluginLoader<Keys>) {
    this.dynamicLoaders.push([pattern, loader])
    this.dc.onDynamicPluginLoaderAdded.publish({ pattern, loader })
  }

  load(key: string, plugin: ResourcePlugin<Resource, Options>) {
    if (this.plugins.has(key)) throw new PluginAlreadyLoadedError(`Plugin for "${key}" already loaded`)
    this.plugins.set(key, plugin)
    this.dc.onPluginLoaded.publish({ key, plugin })
  }

  abstract _buildResource(key: string, ...options: Options): Promise<Resource>
  abstract _dynamicPluginLoad(key: string): Promise<void>

  async from(key: string, ...options: Options): Promise<Resource> {
    try {
      return await this._buildResource(key, ...options)
    } catch (error) {
      if (error instanceof PluginNotLoadedError) {
        try {
          await this._dynamicPluginLoad(key)
          return await this._buildResource(key, ...options)
        } catch (error2) {
          this.plugins.delete(key)
          throw new PluginNotLoadedError(`Tried dynamic load for "${key}", but it failed.`, {
            cause: new AggregateError([error, error2]),
          })
        }
      }
      throw error
    }
  }
}
