export interface Plugin<T = any> {
  build(url: URL): Promise<T>
}

export class Registory<T> {
  private map = new Map<string, Plugin<T>>();
  register(protocol: string, plugin: Plugin<T>) {
    this.map.set(protocol, plugin);
  }
  from(url: string) {
    const url_ = new URL(url);
    const plugin = this.map.get(url_.protocol);
    if (!plugin) throw new Error(`No plugin registered for protocol ${url_.protocol}`)
    return plugin.build(url_);
  }
}
