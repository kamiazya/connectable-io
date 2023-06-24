import { Storage } from '@pluggable-io/storage';

import { FileSystemPlugin } from './plugin.js';

Storage.register('fs:', new FileSystemPlugin());
