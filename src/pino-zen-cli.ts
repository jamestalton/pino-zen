import { once } from 'events'
import { fstatSync } from 'fs'
import split2 from 'split2'
import { pipeline, Writable } from 'stream'
import { FormatMessage, PinoZenOptions } from './pino-zen-format'

const args = process.argv.slice(2)

const pinoZenOptions: PinoZenOptions = {
    formatter: {},
}

for (const arg of args) {
    try {
        if (arg.startsWith('-left=')) {
            const props = arg.slice(6).split(':')
            if (props.length !== 2) continue
            const prop = props[0]
            const pad = Number(props[1])
            if (!Number.isInteger(pad) || pad <= 0) continue
            pinoZenOptions.formatter[prop] = { padStart: pad }
        } else if (arg.startsWith('-right=')) {
            const props = arg.slice(7).split(':')
            if (props.length !== 2) continue
            const prop = props[0]
            const pad = Number(props[1])
            if (!Number.isInteger(pad) || pad <= 0) continue
            pinoZenOptions.formatter[prop] = { padEnd: pad }
        }
    } catch {
        // Do nothing
    }
}

console.log(pinoZenOptions)

const myTransportStream = new Writable({
    async write(chunk: Buffer, enc, cb) {
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
