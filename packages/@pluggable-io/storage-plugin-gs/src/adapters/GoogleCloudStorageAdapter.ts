/// <reference lib="esnext" />
import { Readable, Writable } from 'node:stream'
import { join } from 'node:path'
import { Storage as Client } from '@google-cloud/storage'
import {
  FileNotExistsError,
  FileHandle,
  Storage,
  FileHandleOpenOptions,
  PermissionDeniedError,
  OperationFailedError,
} from '@pluggable-io/storage'

interface GoogleCloudStorageAdapterOptions {
  urlSchema?: string
  bucket: string
  prefix?: string
}

export class GoogleCloudStorageAdapter implements Storage {
  public readonly client: Client

  public readonly urlSchema: string
  public readonly prefix: string
  public readonly _bucket: string

  constructor({ urlSchema = 'gs:', bucket, prefix = '' }: GoogleCloudStorageAdapterOptions) {
    this.client = new Client()
    this.urlSchema = urlSchema
    this.prefix = prefix
    this._bucket = bucket
  }

  public get url(): URL {
    return new URL(`${this.urlSchema}://${join(this._bucket, this.prefix)}`)
  }

  get bucket() {
    return this.client.bucket(this._bucket)
  }

  resolvePath(...filePath: string[]) {
    const path = join(this.prefix, ...filePath)
    return path.at(0) === '/' ? path.slice(1) : path
  }

  async exists(filePath: string): Promise<boolean> {
    const [exists] = await this.bucket.file(this.resolvePath(filePath)).exists()
    return exists
  }

  async delete(filePath: string): Promise<void> {
    const exists = await this.exists(filePath)
    if (exists === false) throw new FileNotExistsError(`File dose not exists. url:${filePath}`)
    await this.bucket.file(this.resolvePath(filePath)).delete()
  }
  async open(
    key: string,
    { read = true, write = false, create = false }: FileHandleOpenOptions = {},
  ): Promise<FileHandle> {
    key = this.resolvePath(key)
    if (key.startsWith('..')) throw new PermissionDeniedError(`Path is out of base directory. url:${key}`)
    return {
      uri: new URL(key, this.url).toString(),
      createReadStream: async () => {
        if (read === false) throw new PermissionDeniedError(`Read permission denied. url:${key}`)
        const exists = await this.exists(key)
        if (exists === false) throw new FileNotExistsError(`File dose not exists. url:${key}`)
        try {
          const readable = this.bucket.file(this.resolvePath(key)).createReadStream()
          return Readable.toWeb(readable)
        } catch (e) {
          throw new OperationFailedError(`Failed to read file. url:${key}`, { cause: e })
        }
      },
      createWriteStream: async () => {
        if (write === false) throw new PermissionDeniedError(`Write permission denied. url:${key}`)

        const exists = await this.exists(key)
        if (exists === false && create === false) throw new FileNotExistsError(`File dose not exists. url:${key}`)

        try {
          const writable = this.bucket.file(this.resolvePath(key)).createWriteStream()
          return Writable.toWeb(writable)
        } catch (e) {
          throw new OperationFailedError(`Failed to write file. url:${key}`, { cause: e })
        }
      },
    }
  }
  async list(filePath?: string) {
    const prefix = this.resolvePath(...(filePath ? [filePath] : []))
    if (prefix.startsWith('..')) throw new PermissionDeniedError(`Path is out of base directory. url:${filePath}`)

    try {
      const [files] = await this.bucket.getFiles({
        prefix: prefix === '.' ? undefined : prefix,
      })
      return files.map((file) => file.name)
    } catch (e) {
      throw new OperationFailedError(`Failed to list files. url:${filePath}`, { cause: e })
    }
  }
}
