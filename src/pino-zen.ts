import { once } from 'events'
import build, { OnUnknown } from 'pino-abstract-transport'
import SonicBoom from 'sonic-boom'
import { Transform } from 'stream'
import { FormatMessage, PinoZenOptions } from './pino-zen-format'

export * from './pino-zen-format'
export default async function (opts: PinoZenOptions) {
    const destination = new SonicBoom({ dest: opts.destination || 1, sync: false })
    await once(destination, 'ready')
    return build(
        async function (source: Transform & OnUnknown): Promise<void> {
            for await (const obj of source) {
                const value = FormatMessage(obj, opts)
                if (!destination.write(value + '\n')) {
                    await once(destination, 'drain')
                }
            }
        },
        {
            async close(err) {
                destination.end()
                await once(destination, 'close')
            },
        }
    )
}
