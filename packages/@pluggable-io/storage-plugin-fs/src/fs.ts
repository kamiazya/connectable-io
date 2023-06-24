import { Readable, Writable } from "node:stream";
import { open, lstat, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

import { FileNotExixtsError, Resource, Storage } from "@pluggable-io/storage";

/**
 * A Storage implementation for the file system
 */
export class FileSystem implements Storage {
  constructor(public readonly url: URL) {}

  resolvePath(...filePath: string[]) {
    return resolve(this.url.pathname, ...filePath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      return !!(await lstat(this.resolvePath(filePath)));
    } catch (e) {
      return false;
    }
  }

  async delete(filePath: string): Promise<void> {
    const exists = await this.exists(filePath);
    if (exists === false)
      throw new FileNotExixtsError(`File dose not exists. url:${filePath}`);
    await rm(this.resolvePath(filePath));
  }
  async get(key: string): Promise<Resource> {
    const exists = await this.exists(key);
    if (exists === false)
      throw new FileNotExixtsError(`File dose not exists. url:${key}`);
    const file = await open(this.resolvePath(key));
    return {
      uri: new URL(key, this.url),
      createReadStream: async () => {
        return Readable.toWeb(file.createReadStream());
      },
      createWriteStream: async () => {
        return Writable.toWeb(file.createWriteStream());
      },
    };
  }
  async list(filePath?: string) {
    return readdir(filePath ? this.resolvePath(filePath): '.');
  }
}
