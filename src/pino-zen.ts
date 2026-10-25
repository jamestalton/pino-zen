import { once } from 'node:events'
import type { Transform } from 'node:stream'
import build, { type OnUnknown } from 'pino-abstract-transport'
// sonic-boom is CommonJS and its named export is not detectable from ESM, so read it off the default export
import sonicBoom from 'sonic-boom'
import { FormatMessage, type PinoZenOptions } from './pino-zen-format.js'

const { SonicBoom } = sonicBoom

export * from './pino-zen-format.js'
export default async function (opts: PinoZenOptions = {}) {
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
            async close() {
                destination.end()
                await once(destination, 'close')
            },
        },
    )
}
