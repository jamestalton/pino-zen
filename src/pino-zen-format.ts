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

export function FormatMessage(message: unknown, opts: { mins?: Record<string, number> }): string {
    if (typeof message === 'string') {
        return message + '\n'
    }

    if (typeof message !== 'object') {
        return '\n'
    }

    let line = ''

    const level = (message as Record<string, unknown>).level
    const msg = (message as Record<string, unknown>).msg

    let dim = false
    switch (level) {
        case 10:
        case 'trace':
            dim = true
            line += Dim + Magenta + 'TRACE  ' + Normal
            break
        case 20:
        case 'debug':
            dim = true
            line += Dim + Blue + 'DEBUG  ' + Normal
            break
        case 30:
        case 'info':
            line += Green + ' INFO  '
            break
        case 40:
        case 'warn':
            dim = true
            line += Dim + Yellow + ' WARN  ' + Normal
            break
        case 50:
        case 'error':
            line += Bold + Red + 'ERROR  ' + Normal
            break
        case 60:
        case 'fatal':
            line += Red + 'FATAL  '
            break
    }
    if (typeof msg === 'string') {
        if (dim) {
            if (typeof opts.mins?.msg !== 'number') line += Normal + Gray + msg + Normal
            else line += Normal + Gray + msg.padStart(opts.mins?.msg, ' ') + Normal
        } else {
            if (typeof opts.mins?.msg !== 'number') line += Normal + Bold + White + msg + Normal
            else line += Normal + Bold + White + msg.padStart(opts.mins?.msg, ' ') + Normal
        }
    }

    for (const key in message) {
        switch (key) {
            case 'msg':
            case 'time':
            case 'level':
                break
            default: {
                const value = (message as Record<string, unknown>)[key]
                line += formatValue(key, value, true, dim)
                break
            }
        }
    }
    return line + Reset
}

function formatValue(key: string | undefined, value: unknown, prefix: boolean, dim: boolean) {
    let line = prefix ? '  ' : ''
    let first = true
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
            if (key) {
                if (value === '') line += Cyan + key
                else {
                    if (dim) line += Dim + Cyan + key + Gray + ':' + Normal + value.toString()
                    else line += Cyan + key + Dim + Gray + ':' + Normal + White + value.toString()
                }
            } else {
                if (value !== '') {
                    if (dim) line += value.toString()
                    else line += White + value.toString()
                }
            }
            break
        case 'undefined':
            if (dim) line += Dim + Cyan + key + Normal
            else line += Cyan + key
            break
        case 'object':
            if (Array.isArray(value)) {
                if (dim) line += Dim + Cyan + key + Gray + ':' + Normal + '[ ' + Normal
                else line += Bold + Cyan + key + Normal + Dim + Gray + ':' + Normal + '[ ' + Normal
                for (const value2 of value) {
                    line += formatValue(undefined, value2, !first, dim)
                    first = false
                }
                line += Gray + ' ]' + Normal
            } else {
                if (dim) line += Dim + Cyan + key + Gray + ':' + Normal + '{ ' + Normal
                else line += Bold + Cyan + key + Normal + Dim + Gray + ':' + Normal + '{ ' + Normal
                for (const key in value) {
                    const value2 = (value as Record<string, unknown>)[key]
                    line += formatValue(key, value2, !first, dim)
                    first = false
                }
                line += Gray + ' }' + Normal
            }
            break
    }
    return line
}
