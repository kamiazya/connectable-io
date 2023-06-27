export type $keywords<T extends string> = {
  [key in T]: key;
};


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
export class Registory<T, SCHEMA extends string> {
  private map = new Map<SCHEMA, ResourcePlugin<T>>();
  /**
   * Register a plugin
   * @param protocol The protocol to register for
   * @param plugin The plugin to register
   */
  register(protocol: SCHEMA, plugin: ResourcePlugin<T>) {
    this.map.set(protocol, plugin);
  }

  /**
   * Build an instance from a URL
   * @param url The URL to build from
   * @returns The built instance
   * @throws If no plugin is registered for the protocol
   */
  from(url: URL): Promise<T> {
    const plugin = this.map.get(url.protocol as SCHEMA);
    if (!plugin) throw new Error(`No plugin registered for protocol ${url.protocol}`)
    return plugin.build(url);
  }
}
