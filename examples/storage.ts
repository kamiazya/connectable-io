import '@pluggable-io/storage-plugin-fs';
import Storage from '@pluggable-io/storage';

const storage = await Storage.from('fs://.');

const files = await storage.list()
console.log(files);
