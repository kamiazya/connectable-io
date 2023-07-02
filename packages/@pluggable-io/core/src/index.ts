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
 * A registry for resources.
 */
export interface Registory<T> {
  /**
   * Register a plugin
   * @param protocol The protocol to register for
   * @param plugin The plugin to register
   * @throws {Error} If a plugin is already registered for the scheme
   * @example
   * ```ts
   * const registory = new Registory();
   *
   * registory.registerPlugin('sample:', {
   *    async build(url) {
   *     return new SampleStorage(url);
   *   }
   * })
   * ```
   */
  registerPlugin(protocol: string, plugin: ResourcePlugin<T>): void;
  /**
   * Build an instance from a URL
   * @param url The URL to build from
   * @returns The built instance
   * @throws {Error} If no plugin is registered for the protocol
   * @throws {TypeError} If url is not a valid URL
   */
  from(url: string): Promise<T>;
}

/**
 * A registry for resources.
 *
 * @todo Add caching mechanism for instances
 */
export class RegistoryCore<T> implements Registory<T> {
  #plugins = new Map<string, ResourcePlugin<T>>();

  registerPlugin(protocol: string, plugin: ResourcePlugin<T>) {
    this.#plugins.set(protocol, plugin);
  }
  from(url: string): Promise<T> {
    const url_ = new URL(url);
    const plugin = this.#plugins.get(url_.protocol);
    if (!plugin) throw new Error(`No plugin registered for protocol ${url_.protocol}`)
    return plugin.build(url_);
  }
}
