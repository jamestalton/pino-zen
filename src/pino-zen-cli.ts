import { once } from 'events'
import split2 from 'split2'
import { pipeline, Writable } from 'stream'
import { FormatMessage } from './pino-zen-format'

const myTransportStream = new Writable({
    async write(chunk: Buffer, enc, cb) {
        let value: string
        try {
            const obj = JSON.parse(chunk.toString()) as unknown
            value = FormatMessage(obj, {})
        } catch {
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
