/**
 * A plugin for building a resource from a URL
 */
export interface ResourcePlugin<T = any> {
  /**
   * Build an instance from a URL
   *
   * @param url The URL to build from
   */
  build(url: URL): Promise<T>
}

/**
 * A registry of plugins
 */
export class Registory<T> {
  private map = new Map<string, ResourcePlugin<T>>();
  /**
   * Register a plugin
   * @param protocol The protocol to register for
   * @param plugin The plugin to register
   */
  register(protocol: string, plugin: ResourcePlugin<T>) {
    this.map.set(protocol, plugin);
  }

  /**
   * Build an instance from a URL
   * @param url The URL to build from
   * @returns The built instance
   * @throws If no plugin is registered for the protocol
   */
  from(url: string): Promise<T> {
    const url_ = new URL(url);
    const plugin = this.map.get(url_.protocol);
    if (!plugin) throw new Error(`No plugin registered for protocol ${url_.protocol}`)
    return plugin.build(url_);
  }
}
