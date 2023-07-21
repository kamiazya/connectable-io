import { Storage } from 'pluggable-io'
const storage = await Storage.from('file://.')

const files = await storage.list()
console.log(`Got ${files.length} files`, { files })
