# bunyan-fork

**bunyan-fork is a lightweight bunyan stream to log propagate logs from a forked child process to a logger in its spawning process**

[![NPM](https://nodei.co/npm/bunyan-fork.png?stars=true&downloads=true)](https://nodei.co/npm/bunyan-fork/)

## Install

`npm i -S bunyan-fork`


## How to use

**child.js**

```js
import { createLogger } from 'bunyan'
import { BunyanFork } from 'bunyan-fork'

const name = 'fork-logger'
const level = 'info'
const stream = new BunyanFork()
const log = createLogger({ name, streams: [{ level, stream }] })

log.info('woohoo, this is getting transmitted as a log to a logger in the parent process!')
```

**parent.js**

```js
import { fork } from 'child_process'
import { createLogger } from 'bunyan'
import { subscribeFork } from 'bunyan-fork'

const name = 'parent-logger'
const level = 'info'
const log = createLogger({ name, level })

subscribeFork(fork('./child.js'), log)

log.info('woohoo, this log will intercept logging from the forked logger as child logs!')
```

## Options

**The BunyanFork class constructor takes a single options argument with the following properties:**

Name            | Type                  | Description
-------------   | -----------------     | -----------
`transformer`   | `function (optional)` | A custom transformer that formats the object to get sent over the IPC communication stream. (Very uncommon to specify this).
