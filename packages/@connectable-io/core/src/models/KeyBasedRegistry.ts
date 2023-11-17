import { PluginNotLoadedError, Registry, ResourceBuildError } from '../types.js'
import { RegistryBase } from './RegistryBase.js'

export class KeyBasedRegistry<Resource, Options extends readonly any[] = []>
  extends RegistryBase<Resource, Options, RegExp | string>
  implements Registry<Resource, Options, RegExp | string>
{
  async _buildResource(key: string, ...options: Options): Promise<Resource> {
    const plugin = this.plugins.get(key)
    if (!plugin) throw new PluginNotLoadedError(`No plugin loaded for protocol "${key}"`)
    try {
      return await plugin.build(key, ...options)
    } catch (error) {
      throw new ResourceBuildError(`Failed to build resource from "${key}"`, {
        cause: error,
      })
    }
  }

  async _dynamicPluginLoad(key: string): Promise<void> {
    for (const [pattern, loader] of this.dynamicLoaders) {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
      if (regex.test(key)) {
        const result = regex.exec(key)
        if (result) {
          await loader(key, result.groups ?? {})
        }
        return
      }
    }
  }
}
