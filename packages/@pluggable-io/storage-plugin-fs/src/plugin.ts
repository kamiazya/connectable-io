import { join } from "node:path";
import { mkdir } from "node:fs/promises";

import { Plugin } from "@pluggable-io/core";
import { Storage } from "@pluggable-io/storage";

import { FS } from "./fs.js";


export const plugin: Plugin<Storage> = {
  async  build(url: URL): Promise<Storage> {
    const path =
      url.host === ""
        ? url.pathname
        : join(process.cwd(), url.host, url.pathname);
    const url_ = new URL(path, url);
    if (url_.host !== "") {
      url_.host = "";
    }
    const storage = new FS(url_);
    const exists = await storage.exists(path);
    if (!exists) {
      await mkdir(path, { recursive: true });
    }
    return storage;
  }
};
