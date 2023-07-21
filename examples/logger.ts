import { Storage, Logger } from 'pluggable-io'
const storage = await Storage.from('file://.')
const logger = await Logger.from('console:')

const files = await storage.list()
logger.log(`Got ${files.length} files`, { files })
