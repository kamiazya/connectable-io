import { PluginNotInstalled } from "./errors.js";
import { Registory, ResourcePlugin } from "./types.js";

/**
 * A registry for resources.
 *
 * @todo Add caching mechanism for instances
 */
export class RegistoryBase<T> implements Registory<T> {
  plugins = new Map<string, ResourcePlugin<T>>();

  registerPlugin(protocol: string, plugin: ResourcePlugin<T>) {
    this.plugins.set(protocol, plugin);
  }

  async from(url: string): Promise<T> {
    const url_ = new URL(url);
    const plugin = this.plugins.get(url_.protocol);
    if (!plugin) throw new PluginNotInstalled(`No plugin registered for protocol "${url_.protocol}"`)
    return plugin.build(url_);
  }
}
