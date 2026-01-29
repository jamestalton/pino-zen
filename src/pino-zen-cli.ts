import { once } from 'node:events'
import { fstatSync } from 'node:fs'
import { pipeline, Writable } from 'node:stream'
import { parseArgs } from 'node:util'
import split2 from 'split2'
import { FormatMessage, type PinoZenOptions, type StringFormatter } from './pino-zen-format.js'

const { values } = parseArgs({
    options: {
        dim: { type: 'string', short: 'd', multiple: true },
        error: { type: 'string', short: 'e', multiple: true },
        module: { type: 'string', short: 'm' },
    },
    strict: false,
})

const formatter: Record<string, false | StringFormatter> = {}
const pinoZenOptions: PinoZenOptions = { formatter }

function addFormatOption(key: string, value: StringFormatter) {
    formatter[key] = { ...formatter[key], ...value }
}

for (const v of (values.dim as string[]) ?? []) {
    addFormatOption(v, { dim: true })
}
for (const v of (values.error as string[]) ?? []) {
    addFormatOption(v, { error: true })
}

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
