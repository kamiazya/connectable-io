import { describe, expect, it } from 'vitest'
import { FileSystemStoragePlugin } from './plugin.js'
import { join } from 'node:path'
import { FileSystemStorageAdapter } from './fs.js'

describe('FileSystemStoragePlugin', () => {
  describe('constructor', () => {
    describe('baseDir option', () => {
      describe('when given an absolute path', () => {
        it('should set baseDir', () => {
          const plugin = new FileSystemStoragePlugin({
            baseDir: '/foo',
          })
          expect(plugin.baseDir).toBe('/foo')
        })
      })
      describe('when given a relative path', () => {
        it('should set baseDir', () => {
          const plugin = new FileSystemStoragePlugin({
            baseDir: 'foo',
          })
          expect(plugin.baseDir).toBe(join(process.cwd(), 'foo'))
        })
      })

      it('should set the baseDir to process.cwd() by default', () => {
        const plugin = new FileSystemStoragePlugin()
        expect(plugin.baseDir).toBe(process.cwd())
      })
    })

    describe('createIfNotExists option', () => {
      it('should set createIfNotExists', () => {
        const plugin = new FileSystemStoragePlugin({
          createIfNotExists: true,
        })
        expect(plugin.createIfNotExists).toBe(true)
      })

      it('should set createIfNotExists to false by default', () => {
        const plugin = new FileSystemStoragePlugin()
        expect(plugin.createIfNotExists).toBe(false)
      })
    })
  })

  describe('build', () => {
    it('should return a FileSystemStorageAdapter', async () => {
      const plugin = new FileSystemStoragePlugin()
      const storage = await plugin.build(new URL('fs://'))
      expect(storage).toBeInstanceOf(FileSystemStorageAdapter)
    })

    // describe('when the URL has a host', () => {
    //   it('should use the host as the baseDir', async () => {
    //     const plugin = new FileSystemStoragePlugin()
    //     const storage = await plugin.build(new URL('fs://foo'))
    //     expect(storage.url.host).toStrictEqual('foo')
    //   })
    // })

    // describe('when the URL has a host', () => {
    //   it('should use the host as the baseDir', async () => {
    //     const plugin = new FileSystemStoragePlugin()
    //     const storage = await plugin.build(new URL('fs://foo'))
    //     expect(storage.url.host).toBe('foo')
    //   })
    // })

    // describe('when the URL has no host', () => {
    //   it('should use the baseDir as the baseDir', async () => {
    //     const plugin = new FileSystemStoragePlugin()
    //     const storage = await plugin.build(new URL('fs:///foo'))
    //     expect(storage.url.host).toBe('')
    //     expect(storage.url.pathname).toBe('/foo')
    //   })
    // })

    // describe('when createIfNotExists is true', () => {
    //   describe('when the baseDir does not exist', () => {
    //     it('should create the baseDir', async () => {
    //       const plugin = new FileSystemStoragePlugin({
    //         createIfNotExists: true
    //       })
    //       const storage = await plugin.build(new URL('fs:///foo'))
    //       expect(storage.baseURL.host).toBe('')
    //       expect(storage.baseURL.pathname).toBe('/foo')
    //     })
    //   })
    // })
  })
})
