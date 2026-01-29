import chalk from 'chalk'

const ObjectStart = chalk.blueBright.dim(':') + chalk.magenta('{ ') // `${Black}:{ ${White}`
const ObjectEnd = chalk.magenta(' }')
const ArrayStart = chalk.blueBright.dim(':') + chalk.yellow('[ ')
const ArrayEnd = chalk.yellow(' ]')

export interface PinoZenOptions {
    destination?: string | number
    formatter?: Record<string, false | StringFormatter>
    module?: string
}

export interface StringFormatter {
    padStart?: number
    padEnd?: number
    error?: boolean
    dim?: boolean
}

const moduleColorCache = new Map<string, (s: string) => string>()
const moduleColors = [chalk.blue, chalk.magenta, chalk.cyan, chalk.blueBright, chalk.magentaBright, chalk.cyanBright]
let nextColorIndex = 0

function getModuleColor(name: string) {
    let color = moduleColorCache.get(name)
    if (!color) {
        color = moduleColors[nextColorIndex % moduleColors.length]
        nextColorIndex++
        moduleColorCache.set(name, color)
    }
    return color
}

export function FormatMessage(inputMessage: unknown, opts: PinoZenOptions): string {
    if (typeof inputMessage === 'string') {
        return inputMessage
    }
    const message = inputMessage as Record<string, unknown>

    let line = ''

    const { level, msg } = message

    if (opts.module && message[opts.module]) {
        const moduleName = String(message[opts.module])
        const color = getModuleColor(moduleName)
        line = `${color(`[${moduleName}]`)}  `

        let msgColor = chalk.whiteBright
        switch (level) {
            case 10:
            case 'trace':
                msgColor = chalk.magentaBright
                break
            case 20:
            case 'debug':
                msgColor = chalk.blueBright
                break
            case 30:
            case 'info':
                msgColor = chalk.greenBright
                break
            case 40:
            case 'warn':
                msgColor = chalk.yellowBright
                break
            case 50:
            case 'error':
                msgColor = chalk.redBright
                break
            case 60:
            case 'fatal':
                msgColor = chalk.redBright.bold
                break
            default:
                break
        }

        if (msg && typeof msg === 'string') {
            line += msgColor(msg)
        }

        for (const key in message) {
            switch (key) {
                case 'msg':
                case 'time':
                case 'level':
                case opts.module:
                    break
                default: {
                    const value = message[key]
                    line += formatValue(key, value, true, opts)
                    break
                }
            }
        }

        return line
    }

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
        default:
            break
    }

    if (msg && typeof msg === 'string') {
        line += chalk.blueBright.dim(':') + chalk.whiteBright.bold(msg)

        for (const key in message) {
            switch (key) {
                case 'msg':
                case 'time':
                case 'level':
                    break
                default: {
                    const value = message[key]
                    line += formatValue(key, value, true, opts)
                    break
                }
            }
        }
    } else {
        if (message.level) {
            line += ' '
        }
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
    if (key && opts.formatter?.[key] === false) {
        return ''
    }

    let keyValueString = prefix ? chalk.blueBright.dim(noSemi ? ', ' : '  ') : ''
    let first = true

    const valueType = typeof value
    switch (valueType) {
        case 'string':
        case 'boolean':
        case 'number':
            if (key) {
                keyValueString += chalk.cyan(key) + chalk.blueBright.dim(':')
            }
            break
        case 'object':
            if (key) {
                if (value === null) {
                    keyValueString += chalk.cyan(key)
                } else {
                    // keyValueString += Blue + key + Dim + Bold + Black + ':' + Reset
                    keyValueString += chalk.blue(key)
                }
            }
            break
        default:
            break
    }

    switch (valueType) {
        case 'string':
            keyValueString += chalk.white(String(value))
            break
        case 'boolean':
            keyValueString += chalk.yellow(String(value))
            break
        case 'number':
            keyValueString += chalk.green(String(value))
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
        default:
            break
    }

    return keyValueString
}
