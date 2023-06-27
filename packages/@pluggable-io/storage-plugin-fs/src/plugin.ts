import { join } from "node:path";
import { mkdir } from "node:fs/promises";

import { ResourcePlugin } from "@pluggable-io/core";

import { FileSystemAdapter } from "./fs.js";

/**
 * A plugin for building a FileSyetem Storage from a URL
 */
export class FileSystemPlugin implements ResourcePlugin<FileSystemAdapter> {

  constructor(
    public baseDir: string = process.cwd()
  ) {}

  async build(url: URL) {
    const path =
      url.host === ""
        ? url.pathname
        : join(this.baseDir, url.host, url.pathname);
    const url_ = new URL(path, url);
    if (url_.host !== "") {
      url_.host = "";
    }
    const storage = new FileSystemAdapter(url_);
    const exists = await storage.exists(path);
    if (!exists) {
      await mkdir(path, { recursive: true });
    }
    return storage;
  }
}
