import { once } from 'node:events'
import build, { type OnUnknown } from 'pino-abstract-transport'
import SonicBoom from 'sonic-boom'
import type { Transform } from 'node:stream'
import { FormatMessage, type PinoZenOptions } from './pino-zen-format'

export * from './pino-zen-format'
export default async function (opts: PinoZenOptions) {
    const destination = new SonicBoom({ dest: opts.destination || 1, sync: false })
    await once(destination, 'ready')
    return build(
        async (source: Transform & OnUnknown): Promise<void> => {
            for await (const obj of source) {
                const value = FormatMessage(obj, opts)
                if (!destination.write(`${value}\n`)) {
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
