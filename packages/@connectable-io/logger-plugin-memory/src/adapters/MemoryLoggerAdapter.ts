import { Logger } from '@connectable-io/logger'

export class MemoryLoggerAdapter implements Logger {
  public logs: any = []
  constructor(public readonly name: string, public globalLogFields: Record<string, any> = {}) {}

  log(message: string, context: Record<string, any> = {}) {
    const entry = Object.assign(
      {
        severity: 'DEFAULT',
        message,
        name: this.name,
      },
      context,
      this.globalLogFields,
    )
    this.logs.push(entry)
  }
  debug(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'DEBUG' })
  }
  info(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'INFO' })
  }
  notice(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'NOTICE' })
  }
  warn(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'WARNING' })
  }
  error(message: string, context: Record<string, any> = {}) {
    this.log(message, { ...context, severity: 'ERROR' })
  }
  setContext(context: Record<string, any>) {
    this.globalLogFields = { ...this.globalLogFields, ...context }
  }

  createChild(name: string, context: Record<string, any> = {}): Logger {
    return new MemoryLoggerAdapter(name, { ...this.globalLogFields, ...context })
  }
}
