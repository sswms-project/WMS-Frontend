type LogLevel = 'log' | 'warn' | 'error' | 'info'

// Stack frame index: 0=Error, 1=getCallerInfo, 2=logger method, 3=caller
const CALLER_FRAME = 3

function getCallerInfo(): string {
  const callerLine = new Error().stack?.split('\n')[CALLER_FRAME] ?? ''
  const match = callerLine.match(/\((.+)\)$/) ?? callerLine.match(/at (.+)$/)
  const full = match?.[1] ?? 'unknown'
  // strip Vite HMR query param (?t=...) then take filename only
  return full.split(/[\\/]/).pop()?.split('?')[0] ?? full
}

function createLogger(level: LogLevel) {
  // ponytail: skip stack parsing in prod — minified names are useless and new Error() is expensive
  if (process.env.NODE_ENV === 'production') {
    return (message: unknown, ...args: unknown[]) => console[level](message, ...args)
  }
  return (message: unknown, ...args: unknown[]) => {
    console[level](`[${getCallerInfo()}]`, message, ...args)
  }
}

export const logger = {
  log: createLogger('log'),
  warn: createLogger('warn'),
  error: createLogger('error'),
  info: createLogger('info'),
}
