import args from 'args'
import { once } from 'events'
import { fstatSync } from 'fs'
import split2 from 'split2'
import { pipeline, Writable } from 'stream'
import { FormatMessage, PinoZenOptions, StringFormatter } from './pino-zen-format'

args.option(['d', 'dim'], 'Dim a value: (`-d something`)')
    .option(['r', 'right'], 'Pad value on right: (`-r msg=10`)')
    .option(['l', 'left'], 'Pad value on left: (`-l cat=20`)')
    .option(['e', 'error'], 'Color as errror: (`-l error`)')

const opts = args.parse(process.argv)

const pinoZenOptions: PinoZenOptions = {
    formatter: {},
}

function addFormatOption(key: string, formatter: StringFormatter) {
    let stringFormatter = pinoZenOptions.formatter[key] as StringFormatter | undefined
    if (!stringFormatter) {
        stringFormatter = {}
        pinoZenOptions.formatter[key] = stringFormatter
    }
    pinoZenOptions.formatter[key] = { ...pinoZenOptions.formatter[key], ...formatter }
}

function addPadLeft(value: string) {
    try {
        const parts = value.split('=')
        if (parts.length === 2) {
            const key = parts[0]
            const value = Number(parts[1])
            if (Number.isInteger(value) && value > 0) {
                addFormatOption(key, { padStart: value })
            }
        }
    } catch {
        // Do nothing
    }
}

function addPadRight(value: string) {
    try {
        const parts = value.split('=')
        if (parts.length === 2) {
            const key = parts[0]
            const value = Number(parts[1])
            if (Number.isInteger(value) && value > 0) {
                addFormatOption(key, { padEnd: value })
            }
        }
    } catch {
        // Do nothing
    }
}

if (opts.dim) {
    if (typeof opts.dim === 'string') {
        addFormatOption(opts.dim, { dim: true })
    } else {
        for (const value of opts.dim as string[]) {
            addFormatOption(value, { dim: true })
        }
    }
}

if (opts.error) {
    if (typeof opts.error === 'string') {
        addFormatOption(opts.error, { error: true })
    } else {
        for (const value of opts.error as string[]) {
            addFormatOption(value, { error: true })
        }
    }
}

if (opts.left) {
    if (typeof opts.left === 'string') {
        addPadLeft(opts.left)
    } else {
        for (const value of opts.left as string[]) {
            addPadLeft(value)
        }
    }
}

if (opts.right) {
    if (typeof opts.right === 'string') {
        addPadRight(opts.right)
    } else {
        for (const value of opts.right as string[]) {
            addPadRight(value)
        }
    }
}

const myTransportStream = new Writable({
    write(chunk: Buffer, enc: BufferEncoding, cb: (error?: Error) => void) {
        async function writeAsync(chunk: Buffer, enc: BufferEncoding, cb: (error?: Error) => void) {
            let value: string
            try {
                const obj = JSON.parse(chunk.toString()) as unknown
                value = FormatMessage(obj, pinoZenOptions)
            } catch (err) {
                value = chunk.toString()
            }
            if (!process.stdout.write(value + '\n')) {
                await once(process.stdout, 'drain')
            }
            cb()
        }
        void writeAsync(chunk, enc, cb)
    },
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
pipeline(process.stdin, split2(), myTransportStream, (err) => {
    // Do nothing
})

if (!process.stdin.isTTY && !fstatSync(process.stdin.fd).isFile()) {
    process.once('SIGINT', noop)
}

function noop() {
    /***/
}
