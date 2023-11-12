/// <reference types="urlpattern-polyfill" />
import { PluginNotLoadedError, Registry, ResourceBuildError } from '../types.js'
import { RegistryBase } from './RegistryBase.js'

export class URLProtocolBasedRegistry<Resource, Options extends readonly any[] = []>
  extends RegistryBase<Resource, Options, string | URLPatternInit>
  implements Registry<Resource, Options, string | URLPatternInit>
{
  async _buildResource(url: string, ...options: Options): Promise<Resource> {
    const url_ = new URL(url)
    const protocol = url_.protocol.slice(0, -1)

    const plugin = this.plugins.get(protocol)
    if (!plugin) throw new PluginNotLoadedError(`No plugin loaded for "${protocol}"`)
    try {
      return await plugin.build(url, ...options)
    } catch (error) {
      throw new ResourceBuildError(`Failed to build resource from "${protocol}"`, {
        cause: error,
      })
    }
  }

  async _dynamicPluginLoad(url: string): Promise<void> {
    for (const [pattern, loader] of this.dynamicLoaders) {
      const urlPattern = new URLPattern(pattern)
      if (urlPattern.test(url)) {
        const result = urlPattern.exec(url)
        if (result) {
          delete (result as any).inputs
          await loader(
            url,
            Object.entries(result).reduce<Record<string, string>>((acc, [key, value]) => {
              console.log(key, value)
              if (value.input === '' || 0 in value.groups) {
                delete value.groups[0]
              }
              return Object.assign(acc, value.groups)
            }, {}),
          )
        }
        return
      }
    }
  }
}
