import { Readable, Writable } from 'node:stream'
import { Storage, FileNotExixtsError } from '@pluggable-io/storage'

export class MemoryStorageAdapter implements Storage {
  public memfs: Map<string, string>
  constructor(entities: [path: string, source: string][] = []) {
    this.memfs = new Map(entities)
  }

  async exists(key: string): Promise<boolean> {
    return this.memfs.has(key)
  }
  async delete(key: string): Promise<void> {
    const exists = await this.exists(key)
    if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)
    this.memfs.delete(key)
  }

  async open(key: string) {
    return {
      uri: new URL('memory://' + key),
      createReadStream: async () => {
        const exists = await this.exists(key)
        if (exists === false) throw new FileNotExixtsError(`File dose not exists. url:${key}`)
        const stream = Readable.from(Buffer.from(this.memfs.get(key) ?? ''))
        return Readable.toWeb(stream)
      },
      createWriteStream: async () => {
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
      },
    }
  }

  async list(prefix: string = '.') {
    return Array.from(this.memfs.keys())
      .filter((key) => prefix === '.' || key.startsWith(prefix))
      .map((key) => (prefix === '.' ? key : key.slice(prefix.length + 1)))
  }
}
