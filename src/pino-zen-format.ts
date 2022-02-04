const Reset = '\x1b[0m'
const Dim = '\x1b[2m'
const Bold = '\x1b[1m'
const Normal = '\x1b[22m'
const Red = '\x1b[31m'
const Green = '\x1b[32m'
const Yellow = '\x1b[33m'
const Blue = '\x1b[34m'
const Magenta = '\x1b[35m'
const Cyan = '\x1b[36m'
const White = '\x1b[37m'
const Gray = '\x1b[90m'

const Trace = Magenta + 'TRACE'
const Debug = Blue + 'DEBUG'
const Info = Bold + Green + ' INFO'
const Warn = Yellow + ' WARN'
const Error = Bold + Red + 'ERROR'
const Fatal = Bold + Red + 'FATAL'

export interface PinoZenOptions {
    destination?: string | number
    minWidths?: Record<string, number>
}

export function FormatMessage(message: unknown, opts: PinoZenOptions): string {
    if (typeof message === 'string') {
        return message + '\n'
    }

    if (typeof message !== 'object') {
        return '\n'
    }

    let line = ''

    const level = (message as Record<string, unknown>).level
    const msg = (message as Record<string, unknown>).msg

    switch (level) {
        case 10:
        case 'trace':
            line += Trace
            break
        case 20:
        case 'debug':
            line += Debug
            line += Bold
            break
        case 30:
        case 'info':
            line += Info
            break
        case 40:
        case 'warn':
            line += Warn
            line += Bold
            break
        case 50:
        case 'error':
            line += Error
            break
        case 60:
        case 'fatal':
            line += Fatal
            break
        default:
            line += '     '
            break
    }

    switch (level) {
        case 10:
        case 'trace':
        case 20:
        case 'debug':
        case 40:
        case 'warn':
            line += Dim
            break

        default:
            line += Bold
            break
    }

    if (typeof msg === 'string') {
        if (typeof opts.minWidths?.msg !== 'number') line += '  ' + White + msg
        else line += '  ' + White + msg.padStart(opts.minWidths.msg, ' ')
    }

    switch (level) {
        case 10:
        case 'trace':
        case 20:
        case 'debug':
        case 40:
        case 'warn':
            line += Normal
            line += Dim
            break
        default:
            line += Normal
            break
    }

    for (const key in message) {
        switch (key) {
            case 'msg':
            case 'time':
            case 'level':
                break
            default: {
                const value = (message as Record<string, unknown>)[key]
                line += formatValue(key, value, true, opts)
                break
            }
        }
    }
    return line + Reset
}

function formatValue(key: string | undefined, value: unknown, prefix: boolean, opts: PinoZenOptions) {
    let line = prefix ? '  ' : ''
    let first = true
    switch (typeof value) {
        case 'string':
        case 'boolean':
        case 'number':
            if (key) line += Cyan + key + ' '
            if (typeof opts.minWidths?.[key] !== 'number') line += White + value.toString()
            else line += White + value.toString().padEnd(opts.minWidths[key], ' ')
            break
        case 'object':
            if (key) line += Cyan + key + ' '
            if (Array.isArray(value)) {
                line += Gray + ' [ '
                for (const value2 of value) {
                    line += formatValue(undefined, value2, !first, opts)
                    first = false
                }
                line += Gray + ' ]'
            } else {
                line += Gray + ' { '
                for (const key in value) {
                    const value2 = (value as Record<string, unknown>)[key]
                    line += formatValue(key, value2, !first, opts)
                    first = false
                }
                line += Gray + ' }'
            }
            break
    }
    return line
}
