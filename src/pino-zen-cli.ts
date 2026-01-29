import { once } from 'node:events'
import { fstatSync } from 'node:fs'
import { Writable, pipeline } from 'node:stream'
import { parseArgs } from 'node:util'
import split2 from 'split2'
import { FormatMessage, type PinoZenOptions, type StringFormatter } from './pino-zen-format.js'

const { values } = parseArgs({
    options: {
        dim: { type: 'string', short: 'd', multiple: true },
        right: { type: 'string', short: 'r', multiple: true },
        left: { type: 'string', short: 'l', multiple: true },
        error: { type: 'string', short: 'e', multiple: true },
    },
    strict: false,
})

const formatter: Record<string, false | StringFormatter> = {}
const pinoZenOptions: PinoZenOptions = { formatter }

function addFormatOption(key: string, value: StringFormatter) {
    formatter[key] = { ...formatter[key], ...value }
}

function addPad(value: string, direction: 'padStart' | 'padEnd') {
    const eq = value.indexOf('=')
    if (eq === -1) {
        return
    }
    const key = value.slice(0, eq)
    const num = Number(value.slice(eq + 1))
    if (Number.isInteger(num) && num > 0) {
        addFormatOption(key, { [direction]: num })
    }
}

for (const v of (values.dim as string[]) ?? []) {
    addFormatOption(v, { dim: true })
}
for (const v of (values.error as string[]) ?? []) {
    addFormatOption(v, { error: true })
}
for (const v of (values.left as string[]) ?? []) {
    addPad(v, 'padStart')
}
for (const v of (values.right as string[]) ?? []) {
    addPad(v, 'padEnd')
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
