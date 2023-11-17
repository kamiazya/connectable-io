import { Logger } from '@connectable-io/logger'

export class NullLoggerAdapter implements Logger {
  constructor(public readonly name: string) {}

  log() {}
  debug() {}
  info() {}
  notice() {}
  warn() {}
  error() {}
  setContext() {}
  createChild(name: string) {
    return new NullLoggerAdapter(name)
  }
}
