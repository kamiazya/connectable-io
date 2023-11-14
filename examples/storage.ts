/**
 * Create a file and write to it, or read a file and write it to another file.
 */
import './polyfill.js'
import { Storage } from 'connectable-io'

try {
  const storage = await Storage.from('file://tmp')

  if ((await storage.exists('.gitignore')) === false) {
    // Create ,gitignore if it doesn't exist
    const file = await storage.open('.gitignore', { write: true, create: true })
    const stream = await file.createWriteStream()
    const writer = stream.getWriter()
    try {
      await writer.write('*')
      console.log('Created .gitignore')
    } catch (e) {
      console.error('Failed to write to .gitignore', e)
    } finally {
      console.log('Closing .gitignore')
      writer.close()
    }
  } else {
    console.log('.gitignore already exists')
  }

  const files = await storage.list()
  console.log(`Got ${files.length} files`, files)

  if (!files.includes('input.txt')) {
    // Create a file and write to it
    console.log('Creating input.txt')
    const file = await storage.open('input.txt', { write: true, create: true })
    const stream = await file.createWriteStream()
    const writer = stream.getWriter()
    try {
      await writer.write('Hello World!')
      console.log('Wrote to input.txt')
    } catch (e) {
      console.error('Failed to write to input.txt', e)
    } finally {
      console.log('Closing input.txt')
      writer.close()
    }
  } else {
    // Read a file and write it to another file
    const input = await storage.open('input.txt')
    const output = await storage.open('output.txt', { write: true, create: true })

    const inputContent = await input.createReadStream()

    const outputContent = await output.createWriteStream()
    console.log('Copying input.txt to output.txt')
    await inputContent.pipeTo(outputContent)
    console.log('Copied input.txt to output.txt')
  }

  const filesAfter = await storage.list()
  console.log(`Got ${filesAfter.length} files`, filesAfter)
} catch (e) {
  console.error(e)
}
