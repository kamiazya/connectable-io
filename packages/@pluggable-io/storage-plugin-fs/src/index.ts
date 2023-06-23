import { Storage } from '@pluggable-io/storage';

import { plugin } from './plugin.js';

Storage.register('fs:', plugin);
