import { Minimatch, escape } from 'minimatch'

/**
 * Get the base directory of a glob pattern
 *
 * @example
 * ```ts
 * getGlobBase('foo/bar/*.js') // => 'foo/bar/'
 * ```
 *
 * @param path
 * @returns the base directory of the glob pattern
 */
export function getGlobBase(path: string) {
  const match = new Minimatch(path)
  if (match.hasMagic()) {
    const escaped = escape(path)
    const idx = escaped.split('').findIndex((c, i) => c !== path.charAt(i))
    return path.slice(0, idx).split('/').slice(0, -1).join('/') + '/'
  }
  return path
}
