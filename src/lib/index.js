import { EventEmitter } from 'events'
import { assert } from 'chai'

const LEVEL_MAP = { 10: 'trace'
                  , 20: 'debug'
                  , 30: 'info'
                  , 40: 'warn'
                  , 50: 'error'
                  , 60: 'fatal'
                  }


export const subscribeFork = (child, logger) => {
  const log = logger.child({ fork_pid: child.pid })
  child.on('message', x => {
    if(x.type === 'bunyan') {
      const { record } = x
      const { name, hostname, pid, level, msg, time, v, err } = record
      assert.ok(level, 'level is required for bunyan propagation')
      assert.ok(payload, 'payload is required for bunyan propagation')
      const levelName = LEVEL_MAP(level)
      log[levelName]({ msg, err })
    }
  })
}

/**
 * defaultTransformer takes arguments from a bunyan WritableStream's write method and formats output in a standard way that can be interpreted by parent process.
 * @param  {...Object} args - args that were passed to WritableStream.prototype.write()
 * @return {Object}           Object to pass through IPC communication channel to parent process.
 */
function defaultTransformer(...args) {
  try {
    let [record, ...rest] = args
    try {
      record = typeof record === 'string' ? JSON.parse(record) : record
    } catch(err) {
      return { type: 'bunyan', record: { err: new Error('Could not parse message.') } }
    }
    return { type: 'bunyan', record }
  } catch(err) {
    return { type: 'bunyan', record: { err: new Error('Internal error occurred.')}}
  }
}

/**
 * Bunyan writable stream that allows a forked process to publish logs to a logger in its parent process.
 */
export class BunyanFork extends EventEmitter {
  constructor({ transformer = defaultTransformer } = {}) {
    assert.ok(transformer)
    assert.typeOf(transformer, 'function')
    super()
    this.transformer = transformer
  }
  write = (...args) => {
    try {
      process.send(this.transformer(...args))
    } catch(err) {
      this.error(err)
      return false
    }
    return true
  };
  error = err => {
    this.emit('error', err)
  };
  end = (...args) => {
    if(args.length > 0)
      this.write(...args)
    this.writable = false
  };
  destroy = () => {
    this.writable = false
    this.emit('close')
  };
  destroySoon = () => {
    this.destroy()
  };
}
