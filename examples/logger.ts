import { Storage, Logger } from 'connectable-io'
const storage = await Storage.from('file://.')
const logger = await Logger.from('console:')

const files = await storage.list()
logger.log(`Got ${files.length} files`, { files })
