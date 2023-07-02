/**
 * Error thrown when a plugin is not installed.
 */
export class PluginNotInstalled extends Error {
  static {
    this.prototype.name = 'PluginNotInstalled'
  }
}
