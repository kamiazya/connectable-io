import { $keywords } from '@pluggable-io/core';
import { Storage } from '@pluggable-io/storage';

import { FileSystemPlugin } from './plugin.js';
import { FileSystemAdapter } from './fs.js';

declare module '@pluggable-io/storage' {
  namespace Storage {
    interface $schema extends $keywords<'fs:'> {}

    interface $storages {
      'fs:': FileSystemAdapter;
    }
  }
}

Storage.register('fs:', new FileSystemPlugin());
