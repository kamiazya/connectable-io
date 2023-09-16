/// <reference lib="esnext" />
import { Readable, Writable } from 'node:stream'
import { Storage, FileNotExixtsError, PermissionDeniedError, OperationFailedError } from '@pluggable-io/storage'
import { normalize } from 'node:path'

import { Minimatch } from 'minimatch'

export class MemoryStorageAdapter implements Storage {
  public memfs: Map<string, string>
  constructor(entities: [path: string, source: string][] = []) {
    this.memfs = new Map(entities)
  }

  async exists(key: string): Promise<boolean> {
    key = normalize(key)
    if (key.startsWith('..')) throw new PermissionDeniedError(`Path is out of base directory. url:${key}`)
    return this.memfs.has(key)
  }
  async delete(key: string): Promise<void> {
    key = normalize(key)
    const exists = await this.exists(key)
    if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)
    this.memfs.delete(key)
  }

  async createReadStream(key: string) {
    const stream = Readable.from(Buffer.from(this.memfs.get(key) ?? ''))
    return Readable.toWeb(stream)
  }

  async createWriteStream(key: string) {
    const chunks: any[] = []

    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        callback()
      },
    })

    stream.on('finish', () => {
      this.memfs.set(key, Buffer.concat(chunks).toString('utf8'))
    })
    return Writable.toWeb(stream)
  }

  async open(key: string, { read = true, write = false, create = false } = {}) {
    key = normalize(key)
    if (key.startsWith('..')) throw new PermissionDeniedError(`Path is out of base directory. url:${key}`)

    return {
      uri: new URL('memory://' + key).toString(),
      createReadStream: async () => {
        if (read === false) throw new PermissionDeniedError(`Read permission denied. url:${key}`)
        const exists = await this.exists(key)
        if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)

        try {
          return await this.createReadStream(key)
        } catch (e) {
          throw new OperationFailedError(`Failed to read file. url:${key}`, { cause: e })
        }
      },
      createWriteStream: async () => {
        if (write === false) throw new PermissionDeniedError(`Write permission denied. url:${key}`)

        const exists = await this.exists(key)
        if (exists === false && create === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)

        try {
          return await this.createWriteStream(key)
        } catch (e) {
          throw new OperationFailedError(`Failed to write file. url:${key}`, { cause: e })
        }
      },
    }
  }

  async _list(prefix: string) {
    const matcher = new Minimatch(prefix)
    return Array.from(this.memfs.keys()).filter((key) => matcher.match(key))
  }

  async list(prefix: string = '*') {
    prefix = normalize(prefix)
    if (prefix.startsWith('..')) throw new PermissionDeniedError(`Path is out of base directory. url:${prefix}`)
    try {
      return await this._list(prefix)
    } catch (e) {
      throw new OperationFailedError(`Failed to list files. url:${prefix}`, { cause: e })
    }
  }
}
