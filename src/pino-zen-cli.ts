import { once } from 'node:events'
import { fstatSync } from 'node:fs'
import { pipeline, Writable } from 'node:stream'
import { parseArgs } from 'node:util'
import split2 from 'split2'
import { FormatMessage, type PinoZenOptions } from './pino-zen-format.js'

const { values } = parseArgs({
    options: {
        module: { type: 'string', short: 'm' },
    },
    strict: false,
})

const pinoZenOptions: PinoZenOptions = {}

if (values.module) {
    pinoZenOptions.module = values.module as string
}

const myTransportStream = new Writable({
    write(chunk: Buffer, _enc: BufferEncoding, cb: (error?: Error) => void) {
        async function writeAsync(chunk: Buffer, cb: (error?: Error) => void) {
            let value: string
            try {
                const obj = JSON.parse(chunk.toString()) as unknown
                value = FormatMessage(obj, pinoZenOptions)
            } catch {
                value = chunk.toString()
            }
            if (!process.stdout.write(`${value}\n`)) {
                await once(process.stdout, 'drain')
            }
            cb()
        }
        void writeAsync(chunk, cb)
    },
})

pipeline(process.stdin, split2(), myTransportStream, () => {})

if (!process.stdin.isTTY && !fstatSync(process.stdin.fd).isFile()) {
    process.once('SIGINT', () => {})
}
