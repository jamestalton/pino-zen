import chalk from 'chalk'

const Reset = '\x1b[0m'
const Dim = '\x1b[2m'
const Bold = '\x1b[1m'
const Normal = '\x1b[22m'
export const Red = '\x1b[31m'
export const Green = '\x1b[32m'
export const Yellow = '\x1b[33m'
export const Blue = '\x1b[34m'
export const Magenta = '\x1b[35m'
export const Cyan = '\x1b[36m'
export const White = '\x1b[37m'
export const Gray = '\x1b[90m'
export const Black = '\x1b[30m'

const BgRed = '\x1b[41m'

const ObjectStart = chalk.blueBright.dim(':') + chalk.magenta('{ ') // `${Black}:{ ${White}`
const ObjectEnd = chalk.magenta(' }')
const ArrayStart = chalk.blueBright.dim(':') + chalk.yellow('[ ')
const ArrayEnd = chalk.yellow(' ]')

export interface PinoZenOptions {
    destination?: string | number
    formatter?: Record<string, false | StringFormatter>
}

export interface StringFormatter {
    padStart?: number
    padEnd?: number
    error?: boolean
    dim?: boolean
}

export function FormatMessage(inputMessage: unknown, opts: PinoZenOptions): string {
    if (typeof inputMessage === 'string') return inputMessage
    const message = inputMessage as Record<string, unknown>

    let line = ''

    const { level, msg, ...details } = message

    switch (level) {
        case 10:
        case 'trace':
            line = chalk.magenta.bold('TRACE')
            break
        case 20:
        case 'debug':
            line = chalk.blue.bold('DEBUG')
            break
        case 30:
        case 'info':
            line = chalk.green.bold(' INFO')
            break
        case 40:
        case 'warn':
            line = chalk.yellow.bold(' WARN')
            break
        case 50:
        case 'error':
            line = chalk.red.bold('ERROR')
            break
        case 60:
        case 'fatal':
            line = chalk.black.bgRed('FATAL')
            break
    }

    if (msg && typeof msg === 'string') {
        line += chalk.blueBright.dim(':') + chalk.whiteBright.bold(msg)

        for (const key in message) {
            let first = !!msg
            switch (key) {
                case 'msg':
                case 'time':
                case 'level':
                    break
                default: {
                    const value = message[key]
                    line += formatValue(key, value, first, opts)
                    first = false
                    break
                }
            }
        }
    } else {
        if (message.level) line += ' '
        let pad = false
        for (const key in message) {
            switch (key) {
                case 'msg':
                case 'time':
                case 'level':
                    break
                default: {
                    const value = message[key]
                    line += formatValue(key, value, pad, opts)
                    pad = true
                    break
                }
            }
        }
    }

    return line
}

function formatValue(key: string | undefined, value: unknown, prefix: boolean, opts: PinoZenOptions, noSemi?: boolean) {
    if (opts.formatter?.key === false) return

    let keyValueString = prefix ? chalk.blueBright.dim(noSemi ? ', ' : '  ') : ''
    let first = true

    const valueType = typeof value
    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
            if (key) keyValueString += chalk.cyan(key) + chalk.blueBright.dim(':')
            break
        case 'object':
            if (key)
                if (value === null) {
                    keyValueString += Cyan + key
                } else {
                    // keyValueString += Blue + key + Dim + Bold + Black + ':' + Reset
                    keyValueString += Blue + key
                }
            break
    }

    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
            keyValueString += White + value.toString()
            break
        case 'object':
            if (Array.isArray(value)) {
                let arrayLine = ArrayStart
                for (const value2 of value) {
                    arrayLine += formatValue(undefined, value2, !first, opts, true)
                    first = false
                }
                arrayLine += ArrayEnd
                keyValueString += arrayLine
            } else if (value === null) {
                // Do nothing
            } else {
                let objectLine = noSemi ? chalk.magenta('{ ') : ObjectStart
                for (const key2 in value as object) {
                    const value2 = (value as Record<string, unknown>)[key2]
                    objectLine += formatValue(key2, value2, !first, opts)
                    first = false
                }
                objectLine += ObjectEnd
                keyValueString += objectLine
            }
            break
    }

    return keyValueString
}
